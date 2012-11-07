/*
 * A little experiment inspired by: http://goo.gl/DsFsL
 * @author Justin Windle
 * @see http://soulwire.co.uk
 */

// Shim shiminy
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL;

function bind( fn, scope ) { return function () { return fn.apply(scope); }; }

var settings = {
    horizontal: true,
    spacing: 0.0,
    center: 0.5,
    alpha: 1.0,
    slit: 1
};

var video = document.createElement( 'video' );
var start = document.getElementById( 'start' );
var intro = document.getElementById( 'intro' );
var noCam = document.getElementById( 'noCam' );
var position = 0;
var first = true;

sketch = Sketch.create({

    autostart: false,
    autoclear: false,
    container: document.getElementById( 'container' ),

    setup: function() {

        navigator.getUserMedia( { video: true }, function( stream ) {
            
            video.autoplay = true;
            video.src = window.URL.createObjectURL( stream );
            video.addEventListener( 'play', bind( sketch.reset, sketch ));

            var gui = new dat.GUI();
            gui.add( settings, 'horizontal' ).onChange( bind( sketch.reset, sketch ) );
            gui.add( settings, 'spacing' ).min( 0 ).max( 20 ).step( 1.0 );
            gui.add( settings, 'center' ).min( 0.0 ).max( 1.0 );
            gui.add( settings, 'alpha' ).min( 0.0 ).max( 1.0 ).step( 0.01 );
            gui.add( settings, 'slit' ).min( 1 ).max( 20 ).step( 1.0 );
            gui.add( sketch, 'toggle' );
            gui.add( sketch, 'clear' );
            gui.add( sketch, 'reset' );
            gui.add( sketch, 'save' );
            gui.close();
            
        }, function( error ) {

            noCam.style.display = 'block';
        });
    },

    reset: function() {
        this.clear();
        position = 0;
        first = true;
    },

    resize: function() {
        this.reset();
    },

    draw: function() {

        var size = video[ 'video' + ( settings.horizontal ? 'Width' : 'Height' ) ];
        var sample = Math.max( 0, Math.min( (size * settings.center) - (settings.slit * 0.5), size - settings.slit ) );

        var sx = settings.horizontal ? sample : 0;
        var sy = settings.horizontal ? 0 : sample;
        var sw = settings.horizontal ? settings.slit : video.videoWidth;
        var sh = settings.horizontal ? video.videoHeight : settings.slit;
        var dx = settings.horizontal ? position : 0;
        var dy = settings.horizontal ? 0 : position;
        var dw = settings.horizontal ? settings.slit : this.width;
        var dh = settings.horizontal ? this.height : settings.slit;

        // Fill screen on first draw
        if ( first && position === 0 ) {

            if ( settings.horizontal ) dw = this.width;
            else dh = this.height;

            first = false;
        }

        this.globalAlpha = settings.alpha;
        this.globalCompositeOperation = 'lighter';
        this.drawImage( video, sx, sy, sw, sh, dx, dy, dw, dh );

        position = (position + settings.slit) % ( this[ settings.horizontal ? 'width' : 'height' ] + settings.slit * 60 ) + settings.spacing;
    },

    save: function() {
        window.open( this.canvas.toDataURL(), 'timecam', "top=20,left=20,width=" + this.width + ",height=" + this.height );
    }
});

start.addEventListener( 'click', function( event ) {
    event.preventDefault();
    intro.parentNode.removeChild( intro );
    sketch.start();
});
