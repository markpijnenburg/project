import json

from collections import Counter

with open('vcdb.json') as f:
    j = json.load(f)
    newDict = {}
    # print(j)
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
                            # newDict[str(year)][country][key] = {}
                            try:
                                for action in data['action']:
                                    # action.upper()
                                    # print(action)
                                    actions.update([action.capitalize()])
                                    world_actions.update([action.capitalize()])
                                    # print(actions)
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


                                    # print(key)
                                    # print(key[i][:1])
            # print(country)
            newDict[year][country]['actions'] = []
            for action in actions:
                newDict[year][country]['actions'].append({"action": action})
                newDict[year][country]['actions'][-1].update({"value": actions[action]})


            newDict[year][country]['assets'] = []
            for asset in assets:
                newDict[year][country]['assets'].append({"asset": asset})
                newDict[year][country]['assets'][-1].update({"value": assets[asset]})
                # newDict[year][country]['assets'][asset] = assets[asset]

        newDict[year]['Worldwide']['actions'] = []
        for action in world_actions:
            newDict[year]['Worldwide']['actions'].append({"action": action})
            newDict[year]['Worldwide']['actions'][-1].update({"value": world_actions[action]})

        newDict[year]["Worldwide"]['assets'] = []
        for asset in world_assets:
            newDict[year]['Worldwide']['assets'].append({"asset": asset})
            newDict[year]['Worldwide']['assets'][-1].update({"value": world_assets[asset]})
            # newDict[year]["Worldwide"]['assets'][asset] = world_assets[asset]


print(json.dumps(newDict))
with open("test_bubble.json", 'w') as outfile:
    json.dump(newDict, outfile)


            # newDict[str(year)][country][]
            # print(year)
            # print(country)
            # print(actions)
            # print(assets)



    #
    #                     for key in data['actor']:
    #                         # print(key)
    #                         if key != 'unknown':
    #                             newDict[str(year)][country][key] = {}
    #                             try:
    #                                 for motive in data['actor'][key]['motive']:
    #                                     if motive == 'NA':
    #                                         motive = 'Unknown'
    #
    #                                     if key == 'internal':
    #                                         internal.update([motive])
    #                                         world_internal.update([motive])
    #
    #                                     elif key == 'external':
    #                                         external.update([motive])
    #                                         world_external.update([motive])
    #                                     else:
    #                                         partner.update([motive])
    #                                         world_parnter.update([motive])
    #                                 # print(year)
    #                                 # print(country)
    #                                 # print(internal)
    #                                 # print(external)
    #                                 # print(partner)
    #                                 for q in internal:
    #                                     if q == 'NA':
    #                                         q = "Unknown"
    #                                     newDict[str(year)][country]['internal'][q] = internal[q]
    #                                 for q in external:
    #                                     if q == 'NA':
    #                                         q = "Unknown"
    #                                     newDict[str(year)][country]['external'][q] = external[q]
    #                                 for q in partner:
    #                                     if q == 'NA':
    #                                         q = "Unknown"
    #                                     newDict[str(year)][country]['partner'][q] = partner[q]
    #
    #                             except KeyError:
    #                                 continue
    #
    #     # newDict[year]['Worldwide']['internal'][]
    #     for motive in world_internal:
    #         newDict[year]['Worldwide']['internal'][motive] = world_internal[motive]
    #     for motive in world_external:
    #         newDict[year]['Worldwide']['external'][motive] = world_external[motive]
    #     for motive in world_parnter:
    #         newDict[year]['Worldwide']['partner'][motive] = world_parnter[motive]
    #
    #     # print()
    #     # print()
    # print(json.dumps(newDict))

        # print(year)
        # print(world_internal)
        # print(world_external)
        # print(world_parnter)

        # newDict[year]['Worldwide'] = {}

    # for year in newDict:
    #     internal = Counter()
    #     external = Counter()
    #     partner = Counter()
    #     for country in newDict[year]:
    #
    #         for data in j:
    #             if data['timeline']['incident']['year'] == int(year) and data['victim']['country'][0] == country:
    #                 for i in data['actor']:
    #                     try:
    #                         for motive in data['actor'][i]['motive']:
    #                             if motive == 'NA':
    #                                 motive = 'Unknown'
    #                             # internal.update([motive])
    #                             if i == "internal":
    #                                 internal.update([motive])
    #                             elif i == 'external':
    #                                 external.update([motive])
    #                             else:
    #                                 partner.update([motive])
    #                     except KeyError:
    #                         continue
    #
    #         if country == 'Worldwide':
    #
    #             # print()
    #             print(year)
    #             print(country)
    #             print(internal)
    #             for motive in external:
    #                 newDict[str(year)][country]['external'] = {motive: {}}
    #                 newDict[str(year)][country]['external'][motive] = external[motive]
    #             for motive in internal:
    #                 newDict[str(year)][country]['internal'] = {motive: {}}
    #                 newDict[str(year)][country]['internal'][motive] = internal[motive]
    #             for motive in partner:
    #                 newDict[str(year)][country]['partner'] = {motive: {}}
    #                 newDict[str(year)][country]['partner'][motive] = partner[motive]
                    # print(str(motive) + " " + str(external[motive]))
                # newDict[str(year)][country][]
                # print(year)

    # print(total)
