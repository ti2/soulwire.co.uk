/**
 * Provides requestAnimationFrame in a cross browser way.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */

if ( !window['requestAnimationFrame'] ) {

    window['requestAnimationFrame'] = ( function() {

        return window['requestAnimationFrame'] ||
        window['mozRequestAnimationFrame'] ||
        window['oRequestAnimationFrame'] ||
        window['msRequestAnimationFrame'] ||
        function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

            window.setTimeout( callback, 1000 / 60 );

        };

    } )();

}

/*
    Vector 2D
*/

function V2D(x,y){
    this.set(x,y);
};

V2D.add = function(v1,v2) {
    return new V2D(v1.x + v2.x, v1.y + v2.y);
};

V2D.sub = function(v1,v2) {
    return new V2D(v2.x - v1.x, v2.y - v1.y);
};

V2D.prototype = {

    // sets the vector components

    set : function(x,y) {
        this.x = x || 0.0;
        this.y = y || 0.0;
    },

    // increment by vector

    inc : function(v) {
        this.x += v.x;
        this.y += v.y;
    },

    // decrement by vector

    dec : function(v) {
        this.x -= v.x;
        this.y -= v.y;
    },

    // multiply by factor

    scale : function(f) {
        this.x *= f;
        this.y *= f;
    },

    norm : function() {
        var m = Math.sqrt(this.x*this.x + this.y*this.y);

        if(m > 0) {
            this.x /= m;
            this.y /= m;
        }
    },

    // limit length

    limit : function(n) {
        var m = Math.sqrt(this.x*this.x + this.y*this.y);

        if(m > 0) {
            this.x /= m;
            this.y /= m;

            this.x *= n;
            this.y *= n;
        }
    },

    // magnitude / length

    mag : function() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    },

    // length squared

    magSq : function() {
        return this.x*this.x + this.y*this.y;
    },

    // dot product

    dot : function(v) {

        return this.x*v.x + this.y*v.y;

    },

    // copy from another vector

    copy : function(v) {
        this.x = v.x;
        this.y = v.y;
    },

    // clone this vector

    clone : function() {
        return new V2D(this.x, this.y);
    },

    // returns angle in radians

    rad : function() {
        return Math.atan2(this.y, this.x);
    },

    // returns angle in degrees

    deg : function() {
        return Math.atan2(this.y, this.x) * 180 / Math.PI;
    }
};

/*
    Particle
*/

function Particle(x,y,mass,radius) {
    
    this.pos        = new V2D(x,y);
    this.acc        = new V2D();
    this.vel        = new V2D();
    this.mass            = mass || 1.0;
    this.massInv    = 1.0 / this.mass;
    this.radius        = radius || 20.0;
    this.fixed        = false;
    
    this.color        = Particle.COLOURS[Math.floor(Math.random() * Particle.COLOURS.length)];
};

Particle.COLOURS = [
    "#FD1811",
    "#F54B45",
    "#F68D0C",
    "#ECF00F",
    "#91C878",
    "#00B9D2"
];

Particle.prototype = {

    update : function() {

        if(!this.fixed) {

            //this.acc.y += GRAVITY;
            this.acc.scale(this.massInv)

            this.vel.inc(this.acc);
            this.pos.inc(this.vel);

            this.vel.scale(0.9);
            this.acc.set(0,0);
        }
    },

    draw : function( context ) {

        // push matrix
        context.save();

        context.translate(this.pos.x, this.pos.y);
        context.rotate(this.vel.rad());
        
        var a = this.vel.magSq();
        
        context.strokeStyle = "rgba(255,255,255," + (0.02 + Math.min(0.5,a * 0.0008)) + ")";
        context.lineWidth = 10 + Math.min(60,a);
        context.beginPath();
        context.arc(0,0,this.radius,0,Math.PI * 2, false);
        context.closePath();
        context.stroke();
        
        /*
        context.beginPath();
        context.moveTo(0,0);
        context.lineTo(this.radius * 1.2,0);
        context.stroke();
        */
        
        context.fillStyle = this.color;
        context.fill();

        // pop matrix
        context.restore();

    }
};

/*
    Spring
*/

function Spring(p1,p2,restLength,springiness,damping) {

    this.p1 = p1;
    this.p2 = p2;

    this.springiness    = springiness || 0.1;
    this.restLength        = restLength || 200.0;
    this.damping        = damping || 0.01;

    this.force            = new V2D();
};

Spring.prototype = {

    update : function() {

        // compute the distance between points
        var dx = this.p1.pos.x - this.p2.pos.x;
        var dy = this.p1.pos.y - this.p2.pos.y;

        var dist = dx*dx+dy*dy;

        if(dist > 0.001) {

            dist = Math.sqrt(dist);
            
            // compute the desired force
            var target = (dist - this.restLength) * this.springiness;

            this.force.set(target,target);
            
            dx = dx / dist;
            dy = dy / dist;

            // apply damping
            this.force.x += this.damping * (this.p1.vel.x - this.p2.vel.x) * dx;
            this.force.y += this.damping * (this.p1.vel.y - this.p2.vel.y) * dy;

            this.force.x *= -dx;
            this.force.y *= -dy;

            // add to velocities
            this.p1.acc.inc(this.force);
            this.p2.acc.dec(this.force);
        }
    },

    draw : function( context ) {

        context.strokeStyle = "rgba(255,255,255,0.05)";
        context.beginPath();
        context.moveTo(this.p1.pos.x, this.p1.pos.y);
        context.lineTo(this.p2.pos.x, this.p2.pos.y);
        context.closePath();
        context.stroke();
    }

};

/*
    Wanderer
*/

function Wanderer( x, y, mass, radius ) {
    
    this.angle    = Math.random() * Math.PI;
    this.wander = 0.25 + Math.random() * 2.5;
    this.speed    = 0.25 + Math.random() * 1.0;
    
    Particle.call( this, x, y, mass, radius );
};

Wanderer.prototype = new Particle();
Wanderer.prototype.constructor = Wanderer;
Wanderer.prototype.supr = Particle.prototype;

Wanderer.prototype.update = function() {
    
    this.angle += -this.wander + Math.random() * this.wander * 2;
    
    this.acc.x += Math.cos( this.angle ) * this.speed;
    this.acc.y += Math.sin( this.angle ) * this.speed;

    this.supr.update.call(this);
};

/*
    Creature
*/

function Creature() {
    
    this.particles    = [];
    this.springs    = [];
    this.dead = false;
    
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    
    this.color = Particle.COLOURS[Math.floor(Math.random() * Particle.COLOURS.length)];
    
    this.init();
};

Creature.prototype = {
    
    init: function() {
        
        var i,
            particle,
            spring,
            radius,
            numParticles = 4 + Math.floor(Math.random() * 6);
        
        for(i = 0; i < numParticles; ++i) {
            
            radius = 2 + Math.random() * 8;
            if( i === 0 ) {
                radius += Math.random() * 15;
            }
            particle = new Wanderer(
                this.x,
                this.y,
                0.4 + Math.random() * 1.2,
                radius
                );
                
            particle.color = this.color;
                
            if( i > 0 ) {
                
                this.springs.push(new Spring(
                    particle,
                    this.particles[Math.floor(Math.random() * i)],
                    Math.random() * 20,
                    0.01 + Math.random() * 0.1,
                    0.01 + Math.random() * 0.1
                ));
                
                if(Math.random() < 0.5) {
                    this.springs.push(new Spring(
                        particle,
                        this.particles[Math.floor(Math.random() * i)],
                        Math.random() * 180
                    )); 
                }
            }
                
            this.particles.push( particle );
        }
        
    },
    
    update: function() {
        
        var i,
            n,
            p,
            minX = Number.MAX_VALUE,
            minY = Number.MAX_VALUE,
            maxX = Number.MIN_VALUE,
            maxY = Number.MIN_VALUE;
        
        for(i = 0, n = this.particles.length; i < n; ++i) {
            p = this.particles[i];
            minX = Math.min(minX, p.pos.x + p.radius);
            maxX = Math.max(minX, p.pos.x - p.radius);
            minY = Math.min(minY, p.pos.y + p.radius);
            maxY = Math.max(minY, p.pos.y - p.radius);
            p.update();
        }
        
        for(i = 0, n = this.springs.length; i < n; ++i) {
            this.springs[i].update();
        }
        
        if( maxX < 0 || 
            minX > window.innerWidth ||
            maxY < 0 || 
            minY > window.innerHeight
            ) {
            
            this.dead = true;
            /*
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight;
            
            for(i = 0, n = this.particles.length; i < n; ++i) {
                p = this.particles[i].pos.set(this.x, this.y);
            }
            */
        }
    },
    
    draw: function( context ) {
        
        var i, n;
        
        for(i = 0, n = this.springs.length; i < n; ++i) {
            this.springs[i].draw( context );
        }
        
        for(i = 0, n = this.particles.length; i < n; ++i) {
            this.particles[i].draw( context );
        }
        
    },
    
    kill: function() {
        this.particles = null;
        this.springs = null;
    }
};

/*
    Main
*/

var framerate        = 1000 / 30;
var mouseX        = 0;
var mouseY        = 0;

function Main() {
    
    var canvas    = document.getElementById("canvas");
    var ctx        = canvas.getContext("2d");
    var creatures = [];
    var toggle = true;
    
    function update() {
        
        var i, c, n = creatures.length;
        
        if(toggle) {
            for(i = 0; i < n; ++i) {
                c = creatures[i];
                if( c.dead ) {
                    c.kill();
                    c = null;
                    creatures[i] = new Creature();
                } else {
                    c.update();
                }
            }
        } else {
            canvas.width = canvas.width;
            ctx.globalAlpha = 0.8;
            ctx.globalCompositeOperation = "lighter";
            for(i = 0; i < n; ++i) {
                creatures[i].draw(ctx);
            }
        }
        
        toggle = !toggle;
        requestAnimationFrame(update);
    }
    
    this.init = function() {
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        for(var i = 0; i < 15; ++i) {
            creatures.push( new Creature() );
        }
        
        window.addEventListener("resize", function(){
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }, false);
        
        update();
    }
    
};

var soup = new Main();
soup.init();