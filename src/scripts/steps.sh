#!/bin/bash
# Initialise ubuntu
sudo apt-get update
sudo apt-get upgrade -y

# Install nginx
sudo apt-get install nginx -y
sudo systemctl start nginx.service
sudo systemctl enable nginx.service

# Configure PHP
sudo add-apt-repository ppa:ondrej/php -y
sudo apt-get install imagemagick php7.4-fpm php7.4-intl php7.4-xml php7.4-curl php7.4-gd php7.4-mbstring php7.4-mysql php7.4-mysql php-apcu php7.4-zip -y
cp ./src/scripts/php.ini /etc/php/7.4/fpm/php.ini

# nano /etc/php/7.4/fpm/php.ini

sudo systemctl restart php7.4-fpm.service

# Configure MariaDB
sudo apt-get install mariadb-server-10.6 mariadb-server-core-10.6 -y

sudo systemctl start mariadb
sudo systemctl enable mariadb

sudo mysql -e "CREATE DATABASE mediawikidb"
sudo mysql -e "GRANT ALL PRIVILEGES ON mediawikidb.* TO admin@'localhost' IDENTIFIED BY 'expressedcode'"
sudo mysql -e "FLUSH PRIVILEGES"

# Configure nginx
sudo cp ./src/scripts/mediawiki /etc/nginx/sites-available
sudo ln -sf /etc/nginx/sites-available/mediawiki /etc/nginx/sites-enabled/mediawiki
sudo rm /etc/nginx/sites-enabled/default

sudo nginx -t

sudo systemctl restart nginx

# Install and configure Mediawiki
sudo wget -O mediawiki.tar.gz https://releases.wikimedia.org/mediawiki/1.38/mediawiki-1.38.4.tar.gz
sudo tar -zxvf mediawiki.tar.gz
sudo mkdir -p /var/www/html/mediawiki
sudo mv mediawiki*/* /var/www/html/mediawiki

sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
sudo chown -R www-data:www-data /var/www/html/mediawiki

sudo cp ./src/docker/LocalSettings-ubuntu-final.php /var/www/html/mediawiki/LocalSettings.php
sudo chown www-data:www-data /var/www/html/mediawiki/LocalSettings.php
sudo systemctl restart nginx

# ln -sf /etc/nginx/sites-available/ec2-44-211-47-215.compute-1.amazonaws.com.conf /etc/nginx/sites-enabled/ec2-44-211-47-215.compute-1.amazonaws.com.conf

# server_name ec2-44-211-47-215.compute-1.amazonaws.com ec2-44-211-47-215.compute-1.amazonaws.com;