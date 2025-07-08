import psycopg

def connect(conninfo):
    return psycopg.connect(conninfo)