
from aitw.insights.insight import Insight

# insight_language
# -----------------------------------------------------
# (Range) | Agent | Language | Total PRs | Merge Rate |
# -----------------------------------------------------

class DailyInsight(Insight):
    
    def __init__(self, db_conninfo):
        super().__init__("insight_daily", db_conninfo)
    
    def refresh(self):
        self.cursor.execute(f"""
        CREATE TABLE {self.staging_table_name} (
            agent text,
            date text,
            total_prs int8,
            closed_prs int8,
            merged_prs int8,
            merge_rate float8,
            merge_rate_lb float8,
            merge_rate_ub float8,
            PRIMARY KEY (agent, date)
        );               
        """)
         
        self.cursor.execute("""
        SELECT agent,
            (to_char(prs.created_at, 'YYYY-MM-DD'::text)) as date,
            count(*) AS total_prs,
            count(*) FILTER (WHERE closed_at IS NOT NULL) AS closed_prs,
            count(*) FILTER (WHERE merged = true) AS merged_prs
        FROM prs
        WHERE created_at >= '2025-05-15 00:00:00'::timestamp without time zone AND agent is NOT NULL
        GROUP BY agent, (to_char(prs.created_at, 'YYYY-MM-DD'::text))
        """)
        
        for agent, date, total_prs, closed_prs, merged_prs in self.cursor.fetchall():
            merge_rate, merge_rate_lb, merge_rate_ub = self.merge_rate(closed_prs, merged_prs)
            
            self.cursor.execute(
                f"""INSERT INTO {self.staging_table_name} 
                (agent, date, total_prs, closed_prs, merged_prs, merge_rate, merge_rate_lb, merge_rate_ub) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""", 
                (agent, date, total_prs, closed_prs, merged_prs, merge_rate, merge_rate_lb, merge_rate_ub)
            )

        self.swap_tables()
        self.conn.commit()