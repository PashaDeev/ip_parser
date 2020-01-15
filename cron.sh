#!/bin/sh

for i in $(seq 1 5); do
  node ~/ip_parser/dist/index.js > ~/ip_parser/log.txt
#  /opt/bin/python3 /opt/etc/movies/digitalreleases2.py > /opt/etc/movies/log.log
  ret=$?
  if [ $ret -eq 0 ]; then
    logger -t "ip parser" "Загрузка завершена успешно."
    break
  else
    logger -t "ip parser" "Ошибка загрузки."
  fi
done
