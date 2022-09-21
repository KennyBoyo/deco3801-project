/* Project code */

// Imports
var { Configuration, OpenAIApi } = require("openai");
var configuration = new Configuration({
  apiKey: "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",
});
var openai = new OpenAIApi(configuration);
var request = require("request").defaults({ jar: true });
var url = "https://127.0.0.1/mediawiki/api.php";

// Create input text box
var inputBox = document.createElement("input");
inputBox.setAttribute("type", "text");
inputBox.id = "userInput";
document.body.appendChild(inputBox);

// Create button to submit user input to GPT-3 and create page
var genBtn = document.createElement("button");
genBtn.innerHTML = "Generate article";
genBtn.addEventListener("click", generateArticle);
document.body.appendChild(genBtn);

// Button click event handler
function generateArticle() {
  var userInput = $("#userInput").val();
  getLoginToken(userInput);
}

// GPT-3
async function textGeneration(userInput) {
  // model
  const response = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: `Write a wikipedia article about ${userInput}.`,
    max_tokens: 1000,
    temperature: 0.1,
  });

  return response.data.choices[0].text;
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
  };

  request.post({ url: url, form: params_3 }, function (error, res, body) {
    if (error) {
      return;
    }
    console.log(body);
    window.location.href = `${userInput.replace(/ /g, "_")}`;
  });
}
