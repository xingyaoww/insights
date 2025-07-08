from typing import Optional, Tuple
from aitw.database.connection import connect
from statsmodels.stats.proportion import proportion_confint


class Insight:
    def __init__(self, table_name, db_conninfo, remove_uncertain=True):
        self.table_name = table_name
        self.staging_table_name = f"staging_{table_name}"
        self.old_table_name = f"old_{table_name}"
        
        self.remove_uncertain = remove_uncertain

        self.conn = connect(db_conninfo)
        self.cursor = self.conn.cursor()

    def merge_rate(
        self, closed: Optional[int], merged: Optional[int]
    ) -> Tuple[Optional[float], Optional[float], Optional[float]]:
        if closed is None or closed == 0:
            return None, None, None
        
        if merged is None:
            merged = 0
            
        merge_rate = merged / closed
        merge_rate_lb, merge_rate_ub = proportion_confint(
            merged, closed, alpha=0.05, method="beta"
        )
        
        # Remove uncertain data points
        if merge_rate_ub - merge_rate_lb > 0.5 and self.remove_uncertain:
            return None, None, None
        
        return merge_rate, merge_rate_lb, merge_rate_ub

    def swap_tables(self):
        self.cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {self.table_name} (
            id SERIAL PRIMARY KEY
        );""")
        self.cursor.execute(
            f"ALTER TABLE {self.table_name} RENAME TO {self.old_table_name};"
        )
        self.cursor.execute(
            f"ALTER TABLE {self.staging_table_name} RENAME TO {self.table_name};"
        )
        self.cursor.execute(f"DROP TABLE {self.old_table_name};")

    def refresh(self):
        pass
