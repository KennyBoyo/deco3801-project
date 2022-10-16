/* Project code */

// Imports
var { Configuration, OpenAIApi } = require("openai");
var configuration = new Configuration({
  apiKey: "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",
});
var openai = new OpenAIApi(configuration);
var request = require("request").defaults({ jar: true });

var url = "http://ec2-3-235-101-167.compute-1.amazonaws.com/api.php";
var currentArticle = "";

// Game is on main page
if ($("#firstHeading")[0].innerHTML == "Main Page") {
  // Create input text box
  var inputBox = document.createElement("input");
  inputBox.setAttribute("type", "text");
  $(inputBox).on("keydown", function (e) {
    var userInput = $("#userInput").val();
    if (e.keyCode == 13) generateArticle(userInput); // Generate on 'enter'
  });
  inputBox.id = "userInput";
  document.body.appendChild(inputBox);

  // Create button to submit user input to GPT-3 and create page
  var genBtn = document.createElement("button");
  genBtn.innerHTML = "Generate article";
  genBtn.addEventListener("click", function () {
    var userInput = $("#userInput").val();
    if (currentArticle.toLowerCase().includes(userInput.toLowerCase())) {
      generateArticle(userInput);
    } else {
      alert("Topic not found");
    }
  });
  document.body.appendChild(genBtn);

  var start, end;
  var articleTitle, article;
  getTwoRandomTopics("gpt3").then((success) => {
    // Start and goal topic section
    var startendTitle = document.createElement("h2");
    startendTitle.innerHTML = "Start and End Topic";
    $("#bodyContentOuter").append(startendTitle);

    // Actual start and goal topics
    start = success[0], end = success[1];
    var startPara = document.createElement("p");
    var endPara = document.createElement("p");
    startPara.innerHTML = `Start: ${start}`;
    endPara.innerHTML = `End: ${end}`;
    $("#bodyContentOuter").append(startPara);
    $("#bodyContentOuter").append(endPara);

    // Start game button
    var startBtn = document.createElement("button");
    startBtn.innerHTML = "Start game";
    startBtn.addEventListener("click", () => generateArticle(start));
    $("#bodyContentOuter").append(startBtn);

    // Reset game button
    var resetBtn = document.createElement("button");
    resetBtn.innerHTML = "Reset";
    resetBtn.addEventListener("click", async () => {
      resetBtn.innerHTML = "Resetting..."
      const topics = await getTwoRandomTopics("gpt3");
      start = topics[0], end = topics[1];
      startPara.innerHTML = `Start: ${start}`;
      endPara.innerHTML = `End: ${end}`;
      resetBtn.innerHTML = "Reset";
    });
    $("#bodyContentOuter").append(resetBtn);

    // Embedded article title
    articleTitle = document.createElement("h2");
    articleTitle.innerHTML = "Wiki Game";
    $("#bodyContentOuter").append(articleTitle);

    // Embedded article content
    article = document.createElement("article");
    article.innerHTML = "Please generate an article.";
    $("#bodyContentOuter").append(article);
  });
}

// Generates a wiki article for a given topic. 
// Article appears on Main_Page and on its own page behind the scenes
function generateArticle(userInput) {
  if (userInput.toLowerCase() == end.toLowerCase()) {
    alert("You've won");
  }
  if (userInput) {
    articleTitle.innerHTML = "Loading...";
    article.innerHTML = "Loading...";
    getLoginToken(userInput);
  }
}

// GPT-3
async function textGeneration(userInput) {
  // model
  const response = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: `Q: What are 2 key subtopics of \"science\"?\nA: History, Etymology\n\n\
    Q: What are 3 key subtopics of \"The Battle of Newtonia\"?\nA: Background, Prelude, Aftermath\n\n\
    Q: What are 2 key subtopics of \"Elise Reiman\"?\nA: Early life, Career\n\n\
    Q: What are 5 key subtopics of \"Astrology\"?\nA: History, Principles and practice, Theological viewpoints, Scientific analysis and criticism, Cultural impact\n\n\
    Q: What are 5 key subtopics of \"cows\"?\nA: Taxonomy, Etymology, Anatomy, Behaviour, Economy\n\n\
    Q: What are 5 key subtopics of \"Elon Musk\"?\nA: Early life, Career, Wealth, Personal Life, Recognition\n\n\
    Q: What are 5 key subtopics of \"University of Queensland\"?\nA: History, Campuses, Faculties and schools, Student life, Notable alumni and faculty\n\n\
    Q: What are 3 key subtopics of \"${userInput}\"?.`,
    max_tokens: 1000,
    temperature: 0.1,
  });

  // split into subtopics in a list
  let subtopics = response.data.choices[0].text;
  let subtopics_list = subtopics.split(", ");
  subtopics_list[0] = subtopics_list[0].substring(4).trim(); // remove prefix "\nA: "

  // compile the wiki article based on the subtopics
  let wikitext = (
    await openai.createCompletion({
      model: "text-davinci-002",
      prompt: `Write a brief overview about ${userInput}`,
      max_tokens: 1000,
      temperature: 0.1,
    })
  ).data.choices[0].text;

  for (let sub of subtopics_list) {
    let output = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: `Write a wikipedia article about ${sub} in relation to ${userInput}`,
      max_tokens: 1000,
      temperature: 0.1,
      presence_penalty: 1,
    });
    wikitext += `\n\n${sub}\n${output.data.choices[0].text}`;
  }

  console.log(subtopics_list);
  console.log(wikitext);

  return wikitext;
}

// Step 1: GET request to fetch login token
function getLoginToken(userInput) {
  var params_0 = {
    action: "query",
    meta: "tokens",
    type: "login",
    format: "json",
  };

  request.get({ url: url, qs: params_0 }, function (error, res, body) {
    if (error) {
      return;
    }
    var data = JSON.parse(body);
    loginRequest(data.query.tokens.logintoken, userInput);
  });
}

// Step 2: POST request to log in.
// Use of main account for login is not
// supported. Obtain credentials via Special:BotPasswords
// (https://www.mediawiki.org/wiki/Special:BotPasswords) for lgname & lgpassword
function loginRequest(login_token, userInput) {
  var params_1 = {
    action: "login",
    lgname: "Admin@beter",
    lgpassword: "7h0ns0lenfv4jso1v37uluncvokpgma6",
    lgtoken: login_token,
    format: "json",
  };

  request.post({ url: url, form: params_1 }, function (error, res, body) {
    if (error) {
      return;
    }
    getCsrfToken(userInput);
  });
}

// Step 3: GET request to fetch CSRF token
function getCsrfToken(userInput) {
  var params_2 = {
    action: "query",
    meta: "tokens",
    format: "json",
  };

  request.get({ url: url, qs: params_2 }, function (error, res, body) {
    if (error) {
      return;
    }
    var data = JSON.parse(body);
    editRequest(data.query.tokens.csrftoken, userInput);
  });
}

// Step 4: POST request to edit a page
async function editRequest(csrf_token, userInput) {
  currentArticle = await textGeneration(userInput);
  var params_3 = {
    action: "edit",
    title: `${userInput.replace(/ /g, "_")}`,
    text: currentArticle,
    token: csrf_token,
    format: "json",
  };

  request.post({ url: url, form: params_3 }, function (error, res, body) {
    if (error) {
      return;
    }
    console.log(body);

    // Embed article
    articleTitle.innerHTML = userInput;
    article.innerHTML = currentArticle.trim().replace(/\n/g, "<br>");
  });
}

async function getTwoRandomTopics(api = "gpt3") {
  if (api == "wikipedia") {
    const wikipediaApi = "https://en.wikipedia.org/w/api.php";
    const params = `?action=query&list=random&rnnamespace=0&rnlimit=2&format=json&origin=*`;
    const response = await fetch(wikipediaApi + params);
    if (response.status == 200) {
      const randomTitles = (await response.json()).query.random.map((page) => page.title);
      return randomTitles;
    } else {
      console.log(response.status, response.statusText);
    }
  } else if (api == "gpt3") {
    const prompt = `Give me two unrelated wikipedia article titles.\nDog, Genghis Khan\n
    Give me two unrelated wikipedia article titles.\nApple, Venice\n
    Give me two unrelated wikipedia article titles.\nCancer, Mythology\n
    Give me two unrelated wikipedia article titles.\nNike, Coconut\n
    Give me two unrelated wikipedia article titles.\nNew York City, Donald Duck\n
    Give me two unrelated wikipedia article titles.\nPizza, Tsunami\n
    Give me two unrelated wikipedia article titles.\nLeprosy, Rome\n
    Give me two unrelated wikipedia article titles.\nTaj Mahal, Jaguar\n
    Give me two unrelated wikipedia article titles.\nPop music, Endometriosis\n
    Give me two unrelated wikipedia article titles.\nGrammar, Basketball\n
    Give me two unrelated wikipedia article titles.\nFrank Sinatra, Hinduism\n
    Give me two unrelated wikipedia article titles.\nOlympics, Rabbits\n
    Give me two unrelated wikipedia article titles.\nShakespeare, Fossils\n
    Give me two unrelated wikipedia article titles.\nThe Beatles, The United States\n
    Give me two unrelated wikipedia article titles.\nThe Earth, Tension headaches\n
    Give me two unrelated wikipedia article titles.\nPorsche, The Moon\n
    Give me two unrelated wikipedia article titles.\nTypography, Kangaroos\n
    Give me two unrelated wikipedia article titles.\n`;

    const response = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: prompt,
      max_tokens: 60,
      temperature: 0.8,
      top_p: 1,
    });
  
    const topics = response.data.choices[0].text.split(", ");
    topics[0] = topics[0].trim();
    console.log(topics);
    return topics;
  }
}