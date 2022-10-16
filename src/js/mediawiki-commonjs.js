/* Project code */

// Imports
var { Configuration, OpenAIApi } = require("openai");
var configuration = new Configuration({
  apiKey: "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",
});
var openai = new OpenAIApi(configuration);
var request = require("request").defaults({ jar: true });
var url = "https://127.0.0.1/mediawiki/api.php";

// Game is on main page
if ($("#firstHeading")[0].innerHTML == "Main Page") {
  // Create input text box
  var inputBox = document.createElement("input");
  inputBox.setAttribute("type", "text");
  $(inputBox).on("keydown", function (e) {
    if (e.keyCode == 13) generateArticle(); // Generate on 'enter'
  });
  inputBox.id = "userInput";
  document.body.appendChild(inputBox);

  // Create button to submit user input to GPT-3 and create page
  var genBtn = document.createElement("button");
  genBtn.innerHTML = "Generate article";
  genBtn.addEventListener("click", generateArticle);
  document.body.appendChild(genBtn);

  // Embedded article title
  var articleTitle = document.createElement("h2");
  articleTitle.innerHTML = "Wiki Game";
  $("#bodyContentOuter").append(articleTitle);

  // Embedded article content
  var article = document.createElement("article");
  article.innerHTML = "Please generate an article.";
  $("#bodyContentOuter").append(article);
}

// Button click event handler
function generateArticle() {
  var userInput = $("#userInput").val();
  articleTitle.innerHTML = "Loading...";
  article.innerHTML = "Loading...";
  getLoginToken(userInput);
}

function isInputEmpty(input) {
  return !input || input === "";
}

// GPT-3
async function textGeneration(userInput) {
  // model
  const response = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: `Q: What are 2 key subtopics of \"science\"?\nA: \"History\", \"Etymology\"\n\nQ: What are 3 key subtopics of \"The Battle of Newtonia\"?\nA: \"Background\", \"Prelude\", \"Aftermath\"\n\nQ: What are 2 key subtopics of \"Elise Reiman\"?\nA: \"Early life\", \"Career\"\n\nQ: What are 5 key subtopics of \"Astrology\"?\nA: \"History\", \"Principles and practice\", \"Theological viewpoints\", \"Scientific analysis and criticism\", \"Cultural impact\"\n\nQ: What are 5 key subtopics of \"cows\"?\nA: \"Taxonomy\", \"Etymology\", \"Anatomy\", \"Behaviour\", \"Economy\"\n\nQ: What are 5 key subtopics of \"Elon Musk\"?\nA: \"Early life\", \"Career\", \"Wealth\", \"Personal Life\", \"Recognition\"\n\nQ: What are 5 key subtopics of \"University of Queensland\"?\nA: \"History\", \"Campuses\", \"Faculties and schools\", \"Student life\", \"Notable alumni and faculty\"\n\nQ: What are 5 key subtopics of \"${userInput}\"?.`,
    max_tokens: 1000,
    temperature: 0.1,
  });

  // split into subtopics in a list
  let subtopics = response.data.choices[0].text;
  let subtopics_list = subtopics.split(", ");
  subtopics_list[0] = subtopics_list[0].substring(5);

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
      prompt: `Write a wikipedia article about ${sub.slice(1, -1)} in relation to ${userInput}`,
      max_tokens: 1000,
      temperature: 0.1,
      presence_penalty: 1,
    });
    wikitext += `\n\n${sub.slice(1, -1)}\n${output.data.choices[0].text}`;
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
  var params_3 = {
    action: "edit",
    title: `${userInput.replace(/ /g, "_")}`,
    text: await textGeneration(userInput),
    token: csrf_token,
    format: "json",
    origin: "*",
  };

  request.post({ url: url, form: params_3 }, function (error, res, body) {
    if (error) {
      return;
    }
    console.log(body);

    // Embed article
    articleTitle.innerHTML = userInput;
    article.innerHTML = params_3.text.trim().replace(/\n/g, "<br>");
  });
}