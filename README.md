# Item Format in ./public/data/items.json

## Value | Data type | Required/Optional | Default value (if !null)
Description of how `value` and `key` are used.



# Documentation

## name | String | Required
Used to display the name of `item`.


## image_URL | String | Required 
URL for image to display of `item`.


## pixelated | Boolean | Optional | true
Boolean to set if the `image_URL` image of the item will be pixelized or blurred. 

2D items are best pixelized.


## max | Int | Optional | Infinity
Max amount of `item` someone can buy at one time.


## cost.fcs | Int | Required
Cost of item in FlexCrop Standard, divided from per_item.fcs.

Ex. `cost.fcs=2` & `per_item.fcs=5` will be 5/2. Buying 5 of `item` will cost $2FCS.


## cost.diamond | Int | Required
Cost of item in diamonds, divided from per_item.diamond.

Ex. `cost.diamond=2` & `per_item.diamond=5` will be 5/2. Buying 5 of `item` will cost 2 Diamonds.


## per_item.fcs | Int | Optional | 1
Base amount of `item` that will be bought via FCS, used in conjunction with `cost.fcs` to calculate less than $1FCS `item` value.


## per_item.diamond | Int | Optional | 1
Base amount of `item` that will be bought via diamonds, used in conjunction with `cost.diamond` to calculate less than 1 diamond `item` value.