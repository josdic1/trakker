# Generated Schemas for Music Trakker

from app.extensions import ma
from app.models import Artist, Track, Link, Tag

class ArtistSchema(ma.SQLAlchemyAutoSchema):
    # Nested Relationships
    tracks = ma.Nested('TrackSchema', many=True, exclude=('artist',))
    links = ma.Nested('LinkSchema', many=True, exclude=('artist',))
    tags = ma.Nested('TagSchema', many=True, exclude=('artists',))

    class Meta:
        model = Artist
        load_instance = True
        include_fk = True
        include_relationships = True

class TrackSchema(ma.SQLAlchemyAutoSchema):
    # Nested Relationships
    artist = ma.Nested('ArtistSchema', many=False, exclude=('tracks',))
    links = ma.Nested('LinkSchema', many=True, exclude=('track',))
    tags = ma.Nested('TagSchema', many=True, exclude=('tracks',))

    class Meta:
        model = Track
        load_instance = True
        include_fk = True
        include_relationships = True

class LinkSchema(ma.SQLAlchemyAutoSchema):
    # Nested Relationships
    artist = ma.Nested('ArtistSchema', many=False, exclude=('links',))
    track = ma.Nested('TrackSchema', many=False, exclude=('links',))
    tags = ma.Nested('TagSchema', many=True, exclude=('links',))

    class Meta:
        model = Link
        load_instance = True
        include_fk = True
        include_relationships = True

class TagSchema(ma.SQLAlchemyAutoSchema):
    # Nested Relationships
    artists = ma.Nested('ArtistSchema', many=True, exclude=('tags',))
    tracks = ma.Nested('TrackSchema', many=True, exclude=('tags',))
    links = ma.Nested('LinkSchema', many=True, exclude=('tags',))

    class Meta:
        model = Tag
        load_instance = True
        include_fk = True
        include_relationships = True

# Create ready-to-use instances of your schemas
artist_schema = ArtistSchema()
artists_schema = ArtistSchema(many=True)
track_schema = TrackSchema()
tracks_schema = TrackSchema(many=True)
link_schema = LinkSchema()
links_schema = LinkSchema(many=True)
tag_schema = TagSchema()
tags_schema = TagSchema(many=True)
