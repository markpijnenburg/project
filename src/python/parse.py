"""
Name: Mark Pijnenburg
Student number: 11841117
Minor Programmeren / University of Amsterdam
Visualizing IT Security Incidents
"""

import json

from collections import Counter

with open('vcdb.json') as f:
    j = json.load(f)
    newDict = {}
    count = 0
    for data in j:
        count += 1
        year = str(data['timeline']['incident']['year'])
        newDict[year] = {}

    for data in j:
        year = str(data['timeline']['incident']['year'])
        country = data['victim']['country'][0]
        if country != None:
            newDict[year][country] = {}

    for year in newDict:
        newDict[year]['Worldwide'] = {}
        newDict[year]['Worldwide']['internal'] = {}
        newDict[year]['Worldwide']['external'] = {}
        newDict[year]['Worldwide']['partner'] = {}
        world_internal = Counter()
        world_external = Counter()
        world_parnter = Counter()
        for country in newDict[year]:
            if country != 'null':
                internal = Counter()
                external = Counter()
                partner = Counter()
                newDict[str(year)][country] = [{'actor': "internal"}]
                newDict[str(year)][country].append({"actor": 'external'})
                newDict[str(year)][country].append({"actor": 'partner'})

                for data in j:
                    if data['timeline']['incident']['year'] == int(year) and data['victim']['country'][0] == country:
                        for key in data['actor']:
                            if key != 'unknown':
                                try:
                                    for motive in data['actor'][key]['motive']:
                                        if motive == 'NA':
                                            motive = 'Unknown'

                                        if key == 'internal':
                                            internal.update([motive])
                                            world_internal.update([motive])

                                        elif key == 'external':
                                            external.update([motive])
                                            world_external.update([motive])
                                        else:
                                            partner.update([motive])
                                            world_parnter.update([motive])
                                    for q in internal:
                                        if q == 'NA':
                                            q = "Unknown"
                                        newDict[str(year)][country][0].update({q: internal[q]})
                                    for q in external:
                                        if q == 'NA':
                                            q = "Unknown"
                                        newDict[str(year)][country][1].update({q: external[q]})
                                    for q in partner:
                                        if q == 'NA':
                                            q = "Unknown"
                                        newDict[str(year)][country][2].update({q: partner[q]})

                                except KeyError:
                                    continue

        newDict[str(year)]["Worldwide"] = [{'actor': "internal"}]
        newDict[str(year)]["Worldwide"].append({'actor': "external"})
        newDict[str(year)]["Worldwide"].append({'actor': "partner"})

        for motive in world_internal:
            newDict[year]['Worldwide'][0].update({motive: world_internal[motive]})
        for motive in world_external:
            newDict[year]['Worldwide'][1].update({motive: world_external[motive]})
        for motive in world_parnter:
            newDict[year]['Worldwide'][2].update({motive: world_parnter[motive]})

    print(json.dumps(newDict))
