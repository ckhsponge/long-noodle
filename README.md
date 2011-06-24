Long Noodle
-----------

Long polling using Node.js

* [spongetech.wordpress.com](http://spongetech.wordpress.com/2011/06/24/long-noodle-heroku-long-polling-with-node-js-jquery-rails-cross-site/) -- blog article
* [long-noodle.herokuapp.com/test.html](http://long-noodle.herokuapp.com/test.html) -- example

 It's easy to set up!

First get a heroku account. Then run the below commands.

    gem install heroku
    git clone git://github.com/ckhsponge/long-noodle.git
    cd long-noodle
    heroku create --stack cedar
    git push heroku master
    heroku config:add TOKEN=NOODLE
    heroku ps:scale web=1

edit the file test.html
at the bottom in the js replace 'long-noodle.herokuapp.com' with your server url e.g. 'stuffed-banana-69.herokuapp.com'

Open test.html in your browser and follow the instructions for sending a curl. You should see messages appear in real time in your browser!
