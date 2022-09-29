import openai
openai.api_key = "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"
"""
articles=[1]
for i in range(1):
    output_articles = openai.Completion.create(
        model="text-davinci-002",
        prompt="Generate a random topic title from Wikipedia",
        max_tokens=100,
        temperature=0.9
    )
    articles[i] = output_articles["choices"][0]["text"]


print(articles)
"""

import requests 

S = requests.Session()

URL = "https://en.wikipedia.org/w/api.php"

PARAMS = {
    "action": "query",
    "format": "json",
    "list": "random",
    "rnnamespace": "0",
    "rnlimit": "1"
}

R = S.get(url=URL, params=PARAMS)
DATA = R.json()

RANDOMS = DATA["query"]["random"]

for r in RANDOMS:
    print(r["title"])