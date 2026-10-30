"""Frozen CSV input validation; no rewriting, filtering or inferred ordering."""
import csv
from collections import Counter


def validate_cards(cards, config):
    rules = config['validation']
    count = rules['expectedCardCount']
    if len(cards) != count:
        raise ValueError(f'Expected {count} cards, got {len(cards)}')
    ids = [card['id'] for card in cards]
    if any(not value.strip() for value in ids) or len(set(ids)) != count:
        raise ValueError('Missing or duplicate IDs')
    orders = []
    for card in cards:
        if card['game_id'] != config['gameId']:
            raise ValueError(f"Wrong game: {card['id']}")
        if card['active'] != 'True' or card['printable'] != 'True':
            raise ValueError(f"Inactive or non-printable card: {card['id']}")
        if not card['text'].strip():
            raise ValueError(f"Empty prompt: {card['id']}")
        if card['intensity'] not in config['intensityLabels']:
            raise ValueError(f"Invalid intensity: {card['id']}")
        orders.append(int(card['print_order']))
    if sorted(orders) != list(range(1, count + 1)):
        raise ValueError('print_order must be unique and continuous from 1 to total')
    if dict(Counter(card['category'] for card in cards)) != rules['categoryCounts']:
        raise ValueError('Category counts do not match release configuration')
    if set(config['categoryLabels']) != set(rules['categoryCounts']):
        raise ValueError('Missing category display labels')
    return sorted(cards, key=lambda card: int(card['print_order']))


def load_cards(root, config):
    source = config['contentSource']
    if source['type'] != 'csv' or source['sortBy'] != 'print_order':
        raise ValueError('This adapter requires CSV with explicit print_order')
    with (root / source['path']).open(encoding='utf-8-sig', newline='') as stream:
        return validate_cards(list(csv.DictReader(stream)), config)
