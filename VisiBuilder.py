import urllib.request

url = "https://raw.githubusercontent.com/DarkSnakeGang/GoogleSnakePudding/main/PuddingMod.js"  # Replace with the actual URL of the file you want to download
destination_file = "PuddingMod.js"  # Replace with the desired local file name

urllib.request.urlretrieve(url, destination_file)

visi_file = open("VisibilityMod.js", "w", encoding='utf-8')
visi_init = open("VisibilityInit.js", "r", encoding='utf-8')
pudding = open("PuddingMod.js", "r", encoding='utf-8')
combiner = open("VisiPudding.js", "r", encoding='utf-8')

visi_file.write(pudding.read())
visi_file.write(visi_init.read())
visi_file.write(combiner.read())
pudding.close()
visi_init.close()
visi_file.close()
combiner.close()