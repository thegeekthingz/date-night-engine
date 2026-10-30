"""Validate the supported fronts-only contract before reading/rendering content."""
import math


def validate_config(config):
    if config['schemaVersion'] != '1.0':
        raise ValueError('Unsupported schemaVersion')
    if config['back']['enabled'] or config['output']['modes'] != ['fronts-only'] or config['output']['duplexEnabled']:
        raise ValueError('v0.10 supports fronts-only; duplex requires separate physical QA')
    if config['page']['orientation'] != 'portrait' or config['card']['orientation'] != 'portrait':
        raise ValueError('Only portrait layouts are supported')
    front = config['front']
    for key in ['showCategory', 'showIntensity', 'showPrompt', 'showCardNumber', 'showFooter']:
        if not front[key]:
            raise ValueError(f'Fronts-only template requires {key}')
    if front['showInternalId'] or front['renderRuntimeMedia']:
        raise ValueError('Internal IDs and runtime media are not printable')
    if config['numbering'] != {'enabled': True, 'format': 'NNN/TOTAL', 'source': 'print_order', 'position': 'bottom-right'}:
        raise ValueError('Unsupported numbering contract')
    for value in [config['card']['widthMm'], config['card']['heightMm'], front['promptLineHeight'],
                  front['promptBoxHeightMm'], front['labelFontPt'], front['footerFontPt']]:
        if not math.isfinite(value) or value <= 0:
            raise ValueError('Layout dimensions must be finite positive numbers')
    if not 15 <= front['promptFontMinPt'] <= front['promptFontTargetPt'] <= front['promptFontMaxPt']:
        raise ValueError('Invalid prompt font range')
    if not config['page']['supportedSizes'] or len(set(config['output']['files'].values())) != len(config['page']['supportedSizes']):
        raise ValueError('Missing or duplicate output filenames')
