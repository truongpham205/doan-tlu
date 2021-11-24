#!/usr/bin
DATADIR=/var/

while [ "$#" -gt 0 ]; do
  case $1 in
  -c | --clean)
    createdata="true"
    ;;
  -u | --uglify) uglify=1 ;;
  *)
    echo "Unknown parameter passed: $1"
    exit 1
    ;;
  esac
  shift
done

# echo "Where to deploy: $target"
# echo "Should uglify  : $uglify"

# docker-compose down

# if [[ -n $cleandata ]]; then
#   rm -rf $DATADIR
#   mkdir $DATADIR
# fi

#### USAGE:
#
# ./deploy.sh -t dev -u
# ./deploy.sh --target dev --uglify
#
###
