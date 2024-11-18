var rankings = {};
items.forEach(
  (item) =>
    (rankings[item] = {
      rating: 1000,
      votes: 0,
    })
);
var pairs = [];
var votedItems = [];

function createMatchPairs() {
  var pairs = [];
  var length = items.length;

  for (var i = 0; i < length; i++) {
    for (var j = i + 1; j < length; j++) {
      var pair = [items[i], items[j]];
      pairs.push(pair);
    }
  }

  return pairs;
}

function calculateExpectedWinProbability(ratingDifference) {
  return 1 / (1 + Math.pow(10, ratingDifference / 400));
}

function updateEloRatings(winner, loser) {
  var kFactor = 32;

  var winnerRating = rankings[winner].rating;
  var loserRating = rankings[loser].rating;

  var winnerVotes = rankings[winner].votes;
  var loserVotes = rankings[loser].votes;

  var winnerExpected = calculateExpectedWinProbability(
    loserRating - winnerRating
  );
  var loserExpected = calculateExpectedWinProbability(
    winnerRating - loserRating
  );

  var winnerNewRating = winnerRating + kFactor * (1 - winnerExpected);
  var loserNewRating = loserRating + kFactor * (0 - loserExpected);

  rankings[winner].rating = winnerNewRating;
  rankings[loser].rating = loserNewRating;

  rankings[winner].votes = winnerVotes + 1;
  rankings[loser].votes = loserVotes + 1;
}

function displayMatchOptions(pair) {
  var contentDiv = document.getElementById("content");
  contentDiv.innerHTML = ""; // Clear previous content

  if (pair === null) {
    contentDiv.innerHTML = "<h2>All done!</h2>";
    displayRankings();
    return;
  }

  var html = "<h2>Match</h2>";

  var randomPosition = Math.random() < 0.5 ? 0 : 1;
  var firstItem = pair[randomPosition];
  var secondItem = pair[1 - randomPosition];

  html += '<div class="row">';
  html +=
    '<div class="col-sm-6">' +
    '<div class="card item" onclick="selectWinner(\'' +
    firstItem +
    "', '" +
    secondItem +
    "')\">" +
    '<div class="card-body text-center">' +
    '<h5 class="card-title">' +
    firstItem +
    "</h5>" +
    "</div>" +
    "</div>" +
    "</div>";
  html +=
    '<div class="col-sm-6">' +
    '<div class="card item" onclick="selectWinner(\'' +
    secondItem +
    "', '" +
    firstItem +
    "')\">" +
    '<div class="card-body text-center">' +
    '<h5 class="card-title">' +
    secondItem +
    "</h5>" +
    "</div>" +
    "</div>" +
    "</div>";
  html += "</div>";

  contentDiv.innerHTML = html;
  displayProgress(); // Display the progress

  displayRankings();
}

function selectWinner(winner, loser) {
  updateEloRatings(winner, loser);

  votedItems.push(winner, loser);

  var index = pairs.findIndex(
    (pair) =>
      (pair[0] === winner && pair[1] === loser) ||
      (pair[0] === loser && pair[1] === winner)
  );
  pairs.splice(index, 1);

  if (pairs.length > 0) {
    shuffleArray(pairs);
    var pair = pairs[0];
    displayMatchOptions(pair);
  } else {
    displayMatchOptions(null); // All done!
  }
}

function displayRankings() {
  var contentDiv = document.getElementById("content");

  var sortedItems = Object.keys(rankings).sort(
    (a, b) => rankings[b].rating - rankings[a].rating
  );

  var html = "<h2>Updated Rankings</h2>";
  html += "<ol>";

  sortedItems.forEach(function (item) {
    var rating = Math.round(rankings[item].rating);
    var votes = rankings[item].votes;
    var confidence = calculateConfidence(votes, items.length);
    // If you want to hide ratings until the item reaches a high confidence threshold, uncomment the below
    // if (confidence === "High Confidence") {
    html += "<li>" + item + " <i>(Rating: " + rating + ")</i>";
    html += ' <span class="confidence">' + confidence + "</span>";
    html += "</li>";
    //  }
  });

  html += "</ol>";

  contentDiv.innerHTML += html;
}
// Function to display the number of pairs voted on and the number still to go
function displayProgress() {
  var contentDiv = document.getElementById("content");
  var pairsVoted = votedItems.length / 2;
  var totalPairs = (items.length * (items.length - 1)) / 2;
  var pairsLeft = totalPairs - pairsVoted;

  var progressHTML =
    "<p>" + pairsVoted + "/" + totalPairs + " pairings voted on</p>";

  contentDiv.innerHTML += progressHTML;
}

function calculateConfidence(votes, totalItems) {
  var maxPossibleVotes = totalItems - 1;
  var confidencePercentage = (votes / maxPossibleVotes) * 100;

  if (confidencePercentage < 40) {
    return "Low Confidence";
  } else if (confidencePercentage < 80) {
    return "Medium Confidence";
  } else {
    return "High Confidence";
  }
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
// Function to handle form submission
document
  .getElementById("inputForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission

    var itemsInput = document.getElementById("itemsInput").value;
    items = itemsInput.split(",").map((item) => item.trim());

    var formDiv = document.getElementById("inputForm");
    formDiv.classList.add("hidden");

    var contentDiv = document.getElementById("content");
    contentDiv.classList.remove("hidden");

    var statusDiv = document.getElementById("status");
    statusDiv.classList.remove("hidden");

    rankings = {};
    items.forEach(
      (item) =>
        (rankings[item] = {
          rating: 1000,
          votes: 0,
        })
    );

    pairs = createMatchPairs();
    if (pairs.length > 0) {
      shuffleArray(pairs);
      var pair = pairs[0];
      displayMatchOptions(pair);
    }
  });