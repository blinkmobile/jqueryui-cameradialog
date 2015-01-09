# jqueryui-cameradialog

jQuery UI Camera Dialog Widget

## usage

```javascript
$( "#dialog" )
        .cameraDialog({
            callback: {
                use: function (img) {
                    $("#image img").attr("src", img);
                }
            },
            errors: {
                "PERMISSION_DENIED": "1",
                "NOT_SUPPORTED_ERROR": "2",
                "MANDATORY_UNSATISFIED_ERROR": "3"
            }
        });

```

## development

Running tests:

```sh
npm test
```
