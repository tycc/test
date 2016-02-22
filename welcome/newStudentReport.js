define([
        'butterfly/view',
        'butterfly',
        'main/footer',
        'iscroll',
        'text!bootstrap/bootstrap.css'
    ],
    function(View, Butterfly, Footer, IScroll) {
        var myScroll;
        return View.extend({
            events: {
                "click .round1": "scan",
                "click button":"goBack"
            },
            render: function() {},
            scan: function() {
                butterfly.navigate("welcome/scanResult.html")
            }
        })
    })
