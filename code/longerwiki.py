import openai
openai.api_key = "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"

# need to determine what increases the size of the output
# subtopics?
# -> write a brief overview about TOPIC
# -> write an academic overview of the history of TOPIC
"""
possible branching of subtopics
wikipedia sorts into 13 subtopics:
Culture - encompasses the social behavior and norms found in human societies, as well as the knowledge, beliefs, arts, laws, customs, capabilities and habits of the individuals in these groups.
Geography - field of science devoted to the study of the lands, features, inhabitants, and phenomena of the Earth and planets.
Health - state of physical, mental and social well-being.
History - the past as it is described in written documents, and the study thereof.
Human activities - the various activities done by people. For instance, it includes leisure, entertainment, industry, recreation, war, and exercise.
Mathematics - the study of topics such as quantity (numbers), structure, space, and change. It evolved through the use of abstraction and logical reasoning, from counting, calculation, measurement, and the systematic study of the shapes and motions of physical objects.
Natural science - branch of science concerned with the description, prediction, and understanding of natural phenomena, based on empirical evidence from observation and experimentation.
People - plurality of persons considered as a whole, as is the case with an ethnic group or nation.
Philosophy - study of general and fundamental questions about existence, knowledge, values, reason, mind, and language.
Reference works - compendiums of information, usually of a specific type, compiled in a book for ease of reference. That is, the information is intended to be quickly found when needed.
Religions - social-cultural systems of designated behaviors and practices, morals, worldviews, texts, sanctified places, prophecies, ethics, or organizations, that relates humanity to supernatural, transcendental, or spiritual elements.
Society - group of individuals involved in persistent social interaction, or a large social group sharing the same geographical or social territory, typically subject to the same political authority and dominant cultural expectations. Societies are characterized by patterns of relationships (social relations) between individuals who share a distinctive culture and institutions; a given society may be described as the sum/total of such relationships among its constituent of members.
Technology - the sum of techniques, skills, methods, and processes used in the production of goods or services or in the accomplishment of objectives, such as scientific investigation.
"""

TOPIC = "3Scan"

output_subtopics = openai.Completion.create(
    model="text-davinci-002",
    prompt="List 5 key subtopics of " + TOPIC + ", such as the history of " + TOPIC + " and the etymology of " + TOPIC,
    max_tokens=1000,
    temperature=0.1
)

subtopics = output_subtopics["choices"][0]["text"]
subtopics_list = subtopics.split("\n-")
subtopics_list = subtopics_list[1:]
print(subtopics_list)

wikitext = openai.Completion.create(
    model="text-davinci-002",
    prompt="Write a brief overview about " + TOPIC,
    max_tokens=1000,
    temperature=0.1
)["choices"][0]["text"]

for i in subtopics_list:
    output = openai.Completion.create(
        model="text-davinci-002",
        prompt="Write a wikipedia article with multiple paragraphs about " + i,
        max_tokens=1000,
        temperature=0.1,
        presence_penalty=1
    )
    wikitext += '\n\n' + i + output["choices"][0]["text"]

print(wikitext)