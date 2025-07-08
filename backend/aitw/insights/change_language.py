from collections import defaultdict
from typing import Dict
from tqdm import tqdm
from aitw.database.connection import connect
from aitw.insights.binned import BinnedPRInsight


class ChangeLanguageInsight(BinnedPRInsight):
    languages = [
        "Python",
        "TypeScript",
        "JavaScript",
        "HTML",
        "Java",
        "YAML",
        "Go",
        "JSON",
        "Rust",
        "C#",
        "C++",
        "PHP",
        "Text"
    ]
    
    endings = {
        "py": "Python",
        "ts": "TypeScript",
        "tsx": "TypeScript",
        "js": "JavaScript",
        "jsx": "JavaScript",
        "html": "HTML",
        "css": "HTML",
        "rs": "Rust",
        "java": "Java",
        "cs": "C#",
        "cpp": "C++",
        "hpp": "C++",
        "c": "C",
        "h": "C",
        "php": "PHP",
        "yaml": "YAML",
        "yml": "YAML",
        "go": "Go",
        "json": "JSON",
        "md": "Markdown",
        "txt": "Text"
    }

    def __init__(self, db_conninfo):
        super().__init__(
            "insight_change_language",
            db_conninfo,
            key="repos.primary_language",
            bins=f"""
            CASE 
                WHEN prs_language.language IN ({",".join(f"'{lang}'" for lang in self.languages)}) 
                THEN prs_language.language
                ELSE 'Other'
            END 
            """,
            order=f"""
            CASE 
                {" ".join([f"WHEN prs_language.language = '{name}' THEN {idx}" for idx, name in enumerate(self.languages)])}
                ELSE 1000
            END 
            """,
            remove_uncertain=False,
            joins=["JOIN prs_language on prs.id = prs_language.id"]
            
        )
        self.db_conninfo = db_conninfo
        
    def update_lang_table(self):
        conn = connect(self.db_conninfo)
        conn2 = connect(self.db_conninfo)
        
        with conn2.cursor() as cursor:
            cursor.execute("DROP TABLE prs_language;")
            cursor.execute("""
            CREATE TABLE prs_language (
                id int8 NOT NULL,
                language text,
                PRIMARY KEY (id)
            );               
            """)
        
        language: Dict[str, int] = defaultdict(int)
        common_files: Dict[str, int] = defaultdict(int)
        total = 0
        has_tests = 0
        
        with conn.cursor(name='streaming_all') as cursor:
            print('Estimating total number of prs to analyze...')
            cursor.execute("SELECT reltuples::BIGINT AS estimate FROM pg_class WHERE relname = 'prs';")
            (total_count, ) = cursor.fetchone()
            pbar = tqdm(total=total_count)
            
            cursor.execute("SELECT id, files FROM prs WHERE files is not NULL")
            while True:
                res = cursor.fetchmany(10000)
                if len(res) == 0:
                    break
                
                inserts = []
                
                for id, files in res:
                    if not files:
                        continue
                    
                    result: Dict[str, int] = defaultdict(int)
                    for path, changes in [(f['path'], f['additions'] + f['deletions']) for f in files]:
                        ending = path.split(".")[-1]
                        if path.endswith('package.json') or path.endswith('package-lock.json'):
                            # or ending == 'lock' or ending == 'json' or ending == 'yaml':
                            continue
                        
                        if ending == 'json':
                            common_files[path.split('/')[-1]] += 1
                            
                        # Do ending -> language translation here
                        if ending in self.endings:
                            result[self.endings[ending]] += changes
                        else:
                            result[ending] += changes
                    
                    if len(result.items()) > 0:
                        lang, changes = sorted(result.items(), key=lambda x: x[1])[-1]
                        language[lang] += 1
                    else:
                        language['package.json'] += 1
                    
                    total += 1
                    
                    if len([f['path'] for f in files if "test" in f['path'].lower()]) > 0:
                        has_tests += 1 
                    
                    inserts.append((id, lang))
                    
                    pbar.update(1)
                    
                with conn2.cursor() as insert_cursor:
                    insert_cursor.executemany("""INSERT INTO prs_language (id, language) VALUES (%s, %s) ON CONFLICT DO NOTHING;""", inserts)
                    conn2.commit()
                    
        conn.close()
        conn2.close()

    def refresh(self):
        self.update_lang_table()
        super().refresh()

                
                    