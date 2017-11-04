Made to run on Raspberry Pi running snappy Ubuntu 16.04.

Scrapes twitter sentiment on a particular subject, outputting the average sentiment per hour to output.txt. 

If you leave it running for a month, the day value will line up with previous records causing it to start averaging back into previous values, which is useless. 


# How to use 
``
ssh pipergragg@192.168.0.103
``
``
sudo classic
script /dev/null
screen
cd code/scraping/twit-by-the-hour
nodejs sentiment-by-hour.js
ctrl + a
d 
``
Note: you can use `` screen -r `` to get back into the screen.


ssh pipergragg@192.168.0.103 cat code/scraping/twit-by-the-hour/output.txt
