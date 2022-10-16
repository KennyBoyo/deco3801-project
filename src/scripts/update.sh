#!/bin/bash

# update bundle.js
sudo cp ./src/docker/bundle.js /var/www/html/mediawiki

# update nginx config
sudo cp ./src/scripts/mediawiki /etc/nginx/sites-available
sudo ln -sf /etc/nginx/sites-available/mediawiki /etc/nginx/sites-enabled/mediawiki

# update php config
sudo cp ./src/scripts/php.ini /etc/php/7.4/fpm/php.ini

# update LocalSettings.php
sudo cp ./src/scripts/LocalSettings.php /var/www/html/mediawiki

# restart processes for update
sudo systemctl restart php7.4-fpm.service
sudo systemctl restart nginx