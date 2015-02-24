(function(){

	var box2dUtils;		// classe utilitaire
	var world; 			// "monde" 2dbox
	var canvas;			// notre canvas
	var canvasWidth;	// largeur du canvas
	var canvasHeight;	// hauteur du canvas
	var context;		// contexte 2d
	var SCALE = 30;		// �chelle
	
	var player = null;
	var keys = [];

	// Initialisation
	$(document).ready(function() {
		init();

	});

	// Lancer � l'initialisation de la page
	this.init = function() {
		box2dUtils = new Box2dUtils(SCALE);	// instancier la classe utilitaire

		// R�cup�rer la canvas, ses propri�t�s et le contexte 2d
		canvas = $('#gipCanvas').get(0);
		canvasWidth = parseInt(canvas.width);
		canvasHeight = parseInt(canvas.height);
		context = canvas.getContext('2d');

		world = box2dUtils.createWorld(context); // box2DWorld
		
		// Cr�er le "sol" et le "plafond" de notre environnement physique
		ground = box2dUtils.createBox(world, 400, canvasHeight - 10, 400, 10, true, 'ground');
		ceiling = box2dUtils.createBox(world, 400, -5, 400, 1, true, 'ceiling');
		
		// Cr�er les "murs" de notre environnement physique
		leftWall = box2dUtils.createBox(world, -5, canvasHeight, 1, canvasHeight, true, 'leftWall');
		leftWall = box2dUtils.createBox(world, canvasWidth + 5, canvasHeight, 1, canvasHeight, true, 'leftWall');
		
		// Cr�er les "box"
		box2dUtils.createBox(world, 320, 300, 10, 100, true, 'box');
		box2dUtils.createBox(world, 620, 300, 10, 200, true, 'box');
		box2dUtils.createBox(world, 250, 0, 40, 40, false, 'box');
		box2dUtils.createBox(world, 450, 0, 100, 100, false, 'box');
		
		// Cr�er le player
		player = new Player(SCALE);
		player.createPlayer(world, 25, canvasHeight-30, 20);

		// Ex�cuter le rendu de l'environnement 2d
		window.setInterval(update, 1000 / 60);
		
		// Ajouter le listener de collisions
		addContactListener();
		
		// Ajouter les listeners d'�v�nements
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		
		// D�sactiver les scrollings vertical lors d'un appui sur les touches directionnelles "haut" et "bas"
		document.onkeydown = function(event) {
			return event.keyCode != 38 && event.keyCode != 40;
		}
		
	}

	// Mettre � jour le rendu de l'environnement 2d
	this.update = function() {

		// g�rer les interactions
		handleInteractions();
		
        // effectuer les simulations physiques et mettre � jour le canvas
		world.Step(1 / 60,  10, 10);
		world.DrawDebugData();
		world.ClearForces();
	}
	
	// appuyer sur une touche
	this.handleKeyDown = function(evt) {
		keys[evt.keyCode] = true;
	}

	// relacher une touche
	this.handleKeyUp = function(evt) {
		keys[evt.keyCode] = false;
	}

	// G�rer les interactions
	this.handleInteractions = function() {
		// touche "haut"
		if (keys[38]) {
			player.jump();
		}
		// touches "gauche" et "droite"
		if (keys[37]) {
			player.moveLeft();
		} else if (keys[39]) {
			player.moveRight();
		}	
	}
	
	// D�terminer si l'objet physique est le player
	this.isPlayer = function(object) {
		if (object != null && object.GetUserData() != null) {
			return object.GetUserData() == 'player';
		}
	}
	
	// D�terminer si l'objet physique est les pieds du player
	this.isFootPlayer = function(object) {
		if (object != null && object.GetUserData() != null) {
			return object.GetUserData() == 'footPlayer';
		}
	}
	
	// D�terminer si l'objet physique est le sol ou une box
	this.isGroundOrBox = function(object) {
		if (object != null && object.GetUserData() != null) {
			return (object.GetUserData() == 'box' || object.GetUserData() == 'ground');
		}
	}
	
	// Ajout du listener sur les collisions
	this.addContactListener = function() {
		var b2Listener = Box2D.Dynamics.b2ContactListener;
		//Add listeners for contact
		var listener = new b2Listener;
		
		// Entr�e en contact
		listener.BeginContact = function(contact) {
			var obj1 = contact.GetFixtureA();
			var obj2 = contact.GetFixtureB();
			if (isFootPlayer(obj1) || isFootPlayer(obj2)) {
				if (isGroundOrBox(obj1) || isGroundOrBox(obj2)) {					
					player.jumpContacts ++;	// le joueur entre en contact avec une plate-forme de saut
				}
			}
		}
		
		// Fin de contact
		listener.EndContact = function(contact) {
			var obj1 = contact.GetFixtureA();
			var obj2 = contact.GetFixtureB();
			if (isFootPlayer(obj1) || isFootPlayer(obj2)) {
				if (isGroundOrBox(obj1) || isGroundOrBox(obj2)) {
					player.jumpContacts --;	// le joueur quitte une plate-forme de saut
				}
			}
		}
		listener.PostSolve = function(contact, impulse) {
			// PostSolve
		}
		listener.PreSolve = function(contact, oldManifold) {
		    // PreSolve
		}
		world.SetContactListener(listener);
	}
}());