# COMP3888 T09A GROUP 2 - Project 22 - SepsisUx

# Running
Project can be built and served from the main directory with ```./build -o```
Use ```chmod +x build``` or ```bash build``` to ensure that the file has the correct permissions to run.

# Data
The JSON data, while there is no backend can be automatically updated with ```./getdata```
Use ```chmod +x getdata``` or ```bash getdata``` to ensure that the file has the correct permissions to run.

# Setup of Testing
These instructions are for Ubuntu.
First, ensure that you have updated all your repositories.

```bash
sudo apt-get update
```

Then install Google Chrome.

```bash
sudo curl -sS -o - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add
sudo echo "deb [arch=amd64]  http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list
sudo apt-get -y update
sudo apt-get -y install google-chrome-stable
```

Then install ChromeDriver

```bash
wget https://chromedriver.storage.googleapis.com/2.41/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
sudo mv chromedriver /usr/bin/chromedriver
sudo chown root:root /usr/bin/chromedriver
sudo chmod +x /usr/bin/chromedriver
```

Then install Selenium for Python3.

```bash
pip install selenium
```

# Testing
Tests can be run by executing ```python runner.py``` from within the testing directory.

# Heroku Deployment
For automatic deployment, the deploy script (which will run tests locally first) can be run with the appropriate permissions provided that heroku has been added as a remote repository.
To push to Heroku, login (```heroku login```) and add the remote with ```heroku git:remote -a sepsis-ux```.

## Team Members
- Mark Dagher - mdag4370@uni.sydney.edu.au
- Lin (Flynn) Fu - flynn.fu@sydney.edu.au
- Yuzhen (Allen) Guo - yguo8229@uni.sydney.edu.au
- Phillip Porteous - ppor2353@uni.sydney.edu.au
- John Spicer - jspi0204@uni.sydney.edu.au

## [Wiki](https://bitbucket.org/jspi0204/comp3888-t09a-group-2/wiki/Home)
