from dataclasses import asdict
import json
import logging

from aitw.database.pull_request import PullRequest


class BatchedPullRequestIngestor:
    def __init__(self, conn, cursor, batch_size=100):
        self.conn = conn
        self.cursor = cursor
        self.batch_size = batch_size
        self.buffer = []

    def flush(self):
        self.buffer.sort(key=lambda row: row[0])
        self.cursor.executemany(
            """
        INSERT INTO prs (id, agent, url, title, description, created_at, closed_at, merged, is_draft, additions, deletions, changed_files, comments, commits, reviewers, base_repo_id, head_repo_id, base_ref, head_ref, author_login, author_type, files, commits_list, comments_list)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id)
        DO UPDATE SET 
            agent = EXCLUDED.agent,
            url = EXCLUDED.url,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            created_at = EXCLUDED.created_at,
            closed_at = EXCLUDED.closed_at,
            merged = EXCLUDED.merged,
            is_draft = EXCLUDED.is_draft,
            additions = EXCLUDED.additions,
            deletions = EXCLUDED.deletions,
            changed_files = EXCLUDED.changed_files,
            comments = EXCLUDED.comments,
            commits = EXCLUDED.commits,
            reviewers = EXCLUDED.reviewers,
            base_repo_id = EXCLUDED.base_repo_id,
            head_repo_id = EXCLUDED.head_repo_id,
            base_ref = EXCLUDED.base_ref,
            head_ref = EXCLUDED.head_ref,
            author_login = EXCLUDED.author_login,
            author_type = EXCLUDED.author_type,
            files = EXCLUDED.files,
            commits_list = EXCLUDED.commits_list,
            comments_list = EXCLUDED.comments_list
        """,
            self.buffer,
        )
        self.conn.commit()

        logging.info(f"📊 Ingested {len(self.buffer)} pull requests into db.")
        self.buffer = []

    def ingest(self, pr: PullRequest):
        self.buffer.append(
            (
                pr.id,
                pr.agent,
                pr.url,
                pr.title,
                pr.body,
                pr.created_at,
                pr.closed_at,
                pr.isMerged,
                pr.isDraft,
                pr.additions,
                pr.deletions,
                pr.changed_files,
                pr.comments,
                pr.commits,
                pr.reviews,
                pr.base_repo_id,
                pr.head_repo_id,
                pr.base_ref,
                pr.head_ref,
                pr.actor.login if pr.actor is not None else None,
                pr.actor.type if pr.actor is not None else None,
                json.dumps([asdict(c) for c in pr.files]) if pr.files is not None else None,
                json.dumps([asdict(c) for c in pr.commitsList]) if pr.commitsList is not None else None,
                json.dumps([asdict(c) for c in pr.commentsList]) if pr.commentsList is not None else None
            )
        )

        if len(self.buffer) >= self.batch_size:
            self.flush()
