
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

from aitw.database.connection import connect


@dataclass
class ScrapeJob:
    id: int
    group: str
    
    from_date: datetime
    to_date: datetime
    query: str
    time_key: str
    
    status: str
    failure_count: int
    started_at: str
    
@dataclass 
class CreateScrapeJob:
    group: str
    from_date: datetime
    to_date: datetime
    query: str
    time_key: str
    
class JobManager():
    
    def __init__(self, conninfo):
        self.conn = connect(conninfo)
        
    def close(self):
        self.conn.close()
        
    def delete_all(self, group: str):
        with self.conn.cursor() as cur:
            cur.execute("""
                DELETE FROM jobs WHERE "group" = %s
            """, (group,))
        self.conn.commit()
        
    def create_jobs(self, list: List[CreateScrapeJob]):
        with self.conn.cursor() as cur:
            cur.executemany("""
                INSERT INTO jobs (start, "end", query, "group", time_key)
                VALUES (%s, %s, %s, %s, %s)
            """, [(c.from_date, c.to_date, c.query, c.group, c.time_key) for c in list])
        self.conn.commit()

    
def pick_job(conninfo, group: str | None) -> Optional[ScrapeJob]:
    conn = connect(conninfo)
    with conn.cursor() as cur:
        cur.execute(f"""
            UPDATE jobs
            SET status = 'running', started_at = NOW()
            WHERE id = (
                SELECT id
                FROM jobs
                WHERE status = 'open' {f"""AND "group" = '{group}'""" if group is not None and len(group) > 0 else ''}
                ORDER BY created_at
                FOR UPDATE SKIP LOCKED
                LIMIT 1
            )
            RETURNING id, "group", status, start, "end", query, started_at, failure_count, time_key;
        """)
        res = cur.fetchone()
    conn.commit()
    conn.close()
        
    if res is None: 
        return None
    
    job = ScrapeJob(
        id=res[0],
        group=res[1],
        status=res[2],
        from_date=res[3],
        to_date=res[4],
        query=res[5],
        started_at=res[6],
        failure_count=res[7],
        time_key=res[8]
    )
        
    return job

def mark_job_failed(conninfo: str, job: ScrapeJob):
    conn = connect(conninfo)
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE jobs SET status = 'failed' WHERE id = %s
        """, (job.id, ))
    conn.commit()
    conn.close()

def mark_job_done(conninfo: str, job: ScrapeJob):
    conn = connect(conninfo)
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE jobs SET status = 'done' WHERE id = %s
        """, (job.id, ))
    conn.commit()
    conn.close()
