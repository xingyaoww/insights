from aitw.database.repository import Repository


class BatchedRepositoryIngestor:
    def __init__(self, conn, cursor, batch_size=100):
        self.conn = conn
        self.cursor = cursor
        self.batch_size = batch_size
        self.buffer = []
        
    def flush(self):
        self.buffer.sort(key=lambda row: row[0])
        self.cursor.executemany("""
        INSERT INTO repos (id, name, url, fork, forks, watchers, stars, primary_language)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id)
        DO UPDATE SET 
            id = EXCLUDED.id,
            name = EXCLUDED.name,
            url = EXCLUDED.url,
            fork = EXCLUDED.fork,
            forks = EXCLUDED.forks,
            watchers = EXCLUDED.watchers,
            stars = EXCLUDED.stars,
            primary_language = EXCLUDED.primary_language
        """, self.buffer)
        self.conn.commit()
        self.buffer = []
    
    def ingest(self, repo: Repository):
        self.buffer.append((
            repo.id,
            repo.name,
            repo.url,
            repo.is_fork,
            repo.forks,
            repo.watchers,
            repo.stargazers,
            repo.primary_language
        ))
        
        if len(self.buffer) >= self.batch_size:
            self.flush()
        
   