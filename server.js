var express = require('express');
var bodyParser = require('body-parser');

// Untappd API constants
const UNTAPPD_CLIENT_ID = 'yourApiClientKey';
const UNTAPPD_CLIENT_SECRET = 'yourApiClientSecret';
const UNTAPPD_VENUE_ID = 'yourVenueId';

var app = express();
app.use(bodyParser.json());

// Initialize the app.
var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log('App now running on port', port);
});

// API ROUTES
// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log('ERROR: ' + reason);
  res.status(code || 500).json({'error': message});
}

/*  '/api/beers'
 *    POST: creates a new contact
 */
app.post('/api/beers', function(req, res) {
  const request = require('request');
  var blocks = {};
  var key = 'blocks';
  blocks[key] = [];

  // Set the header
  const header = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: 'Beers that *Co-workers* have recently enjoyed!'
    }
  }

  const divider = {
    type: 'divider'
  }

  blocks[key].push(header);
  blocks[key].push(divider);

  request('https://api.untappd.com/v4/venue/checkins/'+UNTAPPD_VENUE_ID+'?client_id='+UNTAPPD_CLIENT_ID+'&client_secret='+UNTAPPD_CLIENT_SECRET, { json: true }, (err, result, body) => {
    if (err) {
      handleError(result, err.message, 'Failed to get beer list');
    } else {
      var checkins = body['response']['checkins']['items']
      var checkin_counter = 0;
      for(var checkin in checkins) {
        var beer_name = checkins[checkin]['beer']['beer_name'];
        var brewery_name = checkins[checkin]['brewery']['brewery_name'];
        var rating_score = checkins[checkin]['rating_score'];
        var beer_label = checkins[checkin]['beer']['beer_label'];
        var beer_slug = checkins[checkin]['beer']['beer_slug'];
        var rating_score_text = rating_score > 0 ? ' was given *' + rating_score + '* stars!': '';

        var data = {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*' + beer_name + '* from *' + brewery_name + '*' + rating_score_text
          },
          accessory: {
            type: 'image',
            image_url: beer_label,
            alt_text: beer_slug
          },
        };
        blocks[key].push(data);

        var date = checkins[checkin]['created_at'];
        date = date.substring(0, date.length - 6); // Remove ' +0000'
        var date_data = {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: 'Checked in on *' + date + '*'
            }
          ]
        }
        blocks[key].push(date_data);
        blocks[key].push(divider);

        // Can only have 50 blocks in a slack message so only display first 5
        if (checkin_counter++ >= 5)
          break;
      }      

      const api_disclaimer = {
        type: 'section',
        elements: [
          {
            type: 'mrkdwn',
            text: 'Power by Untappd'
          }
        ]
      }
      blocks[key].push(api_disclaimer);
      res.status(200).json(blocks);
    }
  });
}); 


/*  '/api/party'
 *    POST: creates a new contact
 */
app.post('/api/party', function(req, res) {
  const request = require('request');
  var blocks = {};
  var key = 'blocks';
  blocks[key] = [];

  request('https://api.untappd.com/v4/venue/checkins/'+UNTAPPD_VENUE_ID+'?client_id='+UNTAPPD_CLIENT_ID+'&client_secret='+UNTAPPD_CLIENT_SECRET, { json: true }, (err, result, body) => {
    if (err) {
      handleError(result, err.message, 'Failed to get checkin list');
    } else {
      var checkins = body['response']['checkins']['items']
      var checkin_counter = 0;
      var cur_date = new Date();
      for(var checkin in checkins) {
        var date = checkins[checkin]['created_at'];
        var date_array = date.split(" "); // Fri, 08 Nov 2019 03:00:24
        console.log("'" + date_array[1] + "' '" + cur_date.getDate() + "'");
        console.log("'" + date_array[3] + "' '" + cur_date.getFullYear() + "'");
        if (date_array[1] == cur_date.getDate() && date_array[3] == cur_date.getFullYear()) {
          checkin_counter++;
        }
      }

      // Set the header
      var partyStatus = "Let's get this party rolling";
      if (checkin_counter <= 2) {
        partyStatus = 'You might be drinking by yourself OR be starting the best party of the year!!'
      } else if (checkin_counter > 5) {
        partyStatus = "Whoo! Everyone's drinking! Better hurry!";
      }
      const header = {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'There are *' + checkin_counter + '* co-workers drinking! ' + partyStatus
        }
      }

      blocks[key].push(header);    

      const divider = {
        type: 'divider'
      }
      blocks[key].push(divider);

      const api_disclaimer = {
        type: 'section',
        elements: [
          {
            type: 'mrkdwn',
            text: 'Power by Untappd'
          }
        ]
      }
      blocks[key].push(api_disclaimer);

      res.status(200).json(blocks);
    }
  });
});
