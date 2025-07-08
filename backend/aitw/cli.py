import os
import uuid
import click

import aitw.insights.insights as insights_file
import aitw.scrape.worker as scrape_worker
import aitw.scrape.manager as scrape_manager

import dotenv
dotenv.load_dotenv()

@click.group()
def cli():
    pass

@cli.group()
def scrape():
    pass

@scrape.command()
@click.option('--token', default=lambda: os.getenv('GITHUB_TOKEN'), required=True)
@click.option('--id', default=lambda: uuid.uuid4())
@click.option('--group')
@click.option('--db', envvar='POSTGRES_CONNECT', required=True)
def worker(token, id, group, db):
    scrape_worker.worker(token, id, group, db)
    
@scrape.group()
def manager():
    pass

@manager.command()
@click.argument("group")
@click.option('--db', envvar='POSTGRES_CONNECT', required=True)
def stats(group, db):
    scrape_manager.stats(group, db)
    
@manager.command()
@click.option('--db', envvar='POSTGRES_CONNECT', required=True)
def monitor(db):
    scrape_manager.monitor(db)
    
@manager.command()
@click.option('--db', envvar='POSTGRES_CONNECT', required=True)
def update(db):
    scrape_manager.update(db)
    
@manager.command()
@click.option('--db', envvar='POSTGRES_CONNECT', required=True)
def backfill(db):
    scrape_manager.backfill(db)
    
@cli.command()
@click.argument('insight', required=True)
@click.option('--db', envvar='POSTGRES_CONNECT', required=True)
def insights(insight, db):
    insights_file.insights(insight, db)
    
if __name__ == '__main__':
    cli()