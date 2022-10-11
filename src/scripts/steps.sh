sudo apt-get install imagemagick php7.4-fpm php7.4-intl php7.4-xml php7.4-curl php7.4-gd php7.4-mbstring php7.4-mysql php7.4-mysql php-apcu php7.4-zip

nano /etc/php/7.4/fpm/php.ini

sudo systemctl restart php7.4-fpm.service

sudo apt-get install mariadb-server-10.6 mariadb-server-core-10.6

sudo ln -sf /etc/nginx/sites-available/mediawiki /etc/nginx/sites-enabled/mediawiki

sudo nginx -t

sudo systemctl restart nginx

wget -O mediawiki.tar.gz https://releases.wikimedia.org/mediawiki/1.38/mediawiki-1.38.4.tar.gz
sudo tar -zxvf mediawiki.tar.gz
sudo mkdir -p /var/www/html/mediawiki
sudo mv mediawiki*/* /var/www/html/mediawiki

sudo chown -R www-data:www-data /var/www/html/mediawiki

sudo chown www-data:www-data /var/www/html/mediawiki/LocalSettings.php

ln -sf /etc/nginx/sites-available/ec2-44-211-47-215.compute-1.amazonaws.com.conf /etc/nginx/sites-enabled/ec2-44-211-47-215.compute-1.amazonaws.com.conf

server_name ec2-44-211-47-215.compute-1.amazonaws.com ec2-44-211-47-215.compute-1.amazonaws.com;