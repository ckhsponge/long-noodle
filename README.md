Long Noodle
-----------

Long polling using Node.js

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
