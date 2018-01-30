"""
Name: Mark Pijnenburg
Student number: 11841117
Minor Programmeren / University of Amsterdam
Visualizing IT Security Incidents
The second most ugly code ever written by a human
"""

import json

from collections import Counter

with open('vcdb.json') as f:
    j = json.load(f)
    newDict = {}
    for data in j:
        year = str(data['timeline']['incident']['year'])
        newDict[year] = {}

    for data in j:
        year = str(data['timeline']['incident']['year'])
        country = data['victim']['country'][0]
        if country != None:
            newDict[year][country] = {}

    for year in newDict:
        newDict[year]['Worldwide'] = {}
        newDict[year]['Worldwide']['actions'] = {}
        newDict[year]['Worldwide']['assets'] = {}
        world_actions = Counter()
        world_assets = Counter()
        for country in newDict[year]:
            if country != 'null':
                actions = Counter()
                assets = Counter()
                for data in j:
                    if data['timeline']['incident']['year'] == int(year) and data['victim']['country'][0] == country:
                        for key in data['action']:
                            try:
                                for action in data['action']:
                                    actions.update([action.capitalize()])
                                    world_actions.update([action.capitalize()])
                            except KeyError:
                                continue
                        for key in data['asset']['assets']:
                            for i in key:
                                if i == 'variety':
                                    if key[i] == 'Unkown':
                                        assets.update(['Unkown'])
                                        world_assets.update(['Unkown'])
                                    asset = key[i][:1]
                                    if asset == 'M':
                                        asset = "Media"
                                    elif asset == 'N':
                                        asset = "Network"
                                    elif asset == 'P':
                                        asset = "People"
                                    elif asset == 'S':
                                        asset = "Server"
                                    elif asset == 'T':
                                        asset = "Public Terminal"
                                    elif asset == 'U':
                                        asset = "User Device"
                                    elif asset == 'E':
                                        asset = "Embedded"
                                    else:
                                        asset = 'Other'
                                    assets.update([asset])
                                    world_assets.update([asset])

            newDict[year][country]['actions'] = []
            for action in actions:
                newDict[year][country]['actions'].append({"action": action})
                newDict[year][country]['actions'][-1].update({"value": actions[action]})

            newDict[year][country]['assets'] = []
            for asset in assets:
                newDict[year][country]['assets'].append({"asset": asset})
                newDict[year][country]['assets'][-1].update({"value": assets[asset]})

        newDict[year]['Worldwide']['actions'] = []
        for action in world_actions:
            newDict[year]['Worldwide']['actions'].append({"action": action})
            newDict[year]['Worldwide']['actions'][-1].update({"value": world_actions[action]})

        newDict[year]["Worldwide"]['assets'] = []
        for asset in world_assets:
            newDict[year]['Worldwide']['assets'].append({"asset": asset})
            newDict[year]['Worldwide']['assets'][-1].update({"value": world_assets[asset]})

with open("test_bubble.json", 'w') as outfile:
    json.dump(newDict, outfile)
