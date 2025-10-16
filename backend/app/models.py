# Generated Models for Music Trakker

from app.extensions import db
from datetime import datetime, timezone

artist_tags = db.Table('artist_tags',
    db.Column('artist_id', db.Integer, db.ForeignKey('artists.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)

tag_tracks = db.Table('tag_tracks',
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True),
    db.Column('track_id', db.Integer, db.ForeignKey('tracks.id'), primary_key=True)
)

link_tags = db.Table('link_tags',
    db.Column('link_id', db.Integer, db.ForeignKey('links.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)

class Artist(db.Model):
    __tablename__ = 'artists'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # --- Relationships ---
    tracks = db.relationship('Track', back_populates='artist', cascade='all, delete-orphan')
    links = db.relationship('Link', back_populates='artist', cascade='all, delete-orphan')
    tags = db.relationship('Tag', back_populates='artists', secondary=artist_tags)

    def __repr__(self):
        return f'<Artist {self.name}>'



class Track(db.Model):
    __tablename__ = 'tracks'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    artist_id = db.Column(db.Integer, db.ForeignKey('artists.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # --- Relationships ---
    artist = db.relationship('Artist', back_populates='tracks')
    links = db.relationship('Link', back_populates='track', cascade='all, delete-orphan')
    tags = db.relationship('Tag', back_populates='tracks', secondary=tag_tracks)

    def __repr__(self):
        return f'<Track {self.name}>'



class Link(db.Model):
    __tablename__ = 'links'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    artist_id = db.Column(db.Integer, db.ForeignKey('artists.id'), nullable=False)
    track_id = db.Column(db.Integer, db.ForeignKey('tracks.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # --- Relationships ---
    artist = db.relationship('Artist', back_populates='links')
    track = db.relationship('Track', back_populates='links')
    tags = db.relationship('Tag', back_populates='links', secondary=link_tags)

    def __repr__(self):
        return f'<Link {self.name}>'



class Tag(db.Model):
    __tablename__ = 'tags'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # --- Relationships ---
    artists = db.relationship('Artist', back_populates='tags', secondary=artist_tags)
    tracks = db.relationship('Track', back_populates='tags', secondary=tag_tracks)
    links = db.relationship('Link', back_populates='tags', secondary=link_tags)

    def __repr__(self):
        return f'<Tag {self.name}>'



