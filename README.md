# COMP3888 T09A GROUP 2 - Project 22 - SepsisUx

# Requirements
The project requires Node Package Manager (npm) and Angular be installed:

`apt-get npm && npm install -g @angular/cli@latest`



# Running
To simply run the SepsisUx dashboard locally, run the `ng serve` command within the dashboard directory.

Project can be built and served from the main directory with ```./build -o```

Use ```chmod +x build``` or ```bash build``` to ensure that the file has the correct permissions to run.

From the browser, `localhost:4200` will navigate to the SepsisUx dashbaord. 

Running `ng serve --open` from the dashboard directory will both run and navigate to the dashboard from the browser.

# Data
The data is simply a JSON being mocked as a database. This file is `REST-data.json` within the dashboard directory.

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

In order to allow for this, Heroku runs the project as a `node.js` project.

All dependencies and versions used are specified in `dashboard/package.json`.

To push to Heroku, login (```heroku login```) and add the remote with ```heroku git:remote -a sepsis-ux```.

Note that the deployed version is built twice using the `--aot` (for optimisation) and `--prod` (for production-ready deployment) flags to ensure that the project has no errors and runs smoothly.

## Team Members
- Mark Dagher - mdag4370@uni.sydney.edu.au
- Lin (Flynn) Fu - flynn.fu@sydney.edu.au
- Yuzhen (Allen) Guo - yguo8229@uni.sydney.edu.au
- Phillip Porteous - ppor2353@uni.sydney.edu.au
- John Spicer - jspi0204@uni.sydney.edu.au

## [Wiki](https://bitbucket.org/jspi0204/comp3888-t09a-group-2/wiki/Home)