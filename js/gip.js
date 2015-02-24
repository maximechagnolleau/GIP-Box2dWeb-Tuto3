(function(){

	var box2dUtils;		// classe utilitaire
	var world; 			// "monde" 2dbox
	var canvas;			// notre canvas
	var canvasWidth;	// largeur du canvas
	var canvasHeight;	// hauteur du canvas
	var context;		// contexte 2d
	var SCALE = 30;		// échelle
	
	var player = null;
	var keys = [];

	// Initialisation
	$(document).ready(function() {
		init();

	});

	// Lancer à l'initialisation de la page
	this.init = function() {
		box2dUtils = new Box2dUtils(SCALE);	// instancier la classe utilitaire

		// Récupérer la canvas, ses propriétés et le contexte 2d
		canvas = $('#gipCanvas').get(0);
		canvasWidth = parseInt(canvas.width);
		canvasHeight = parseInt(canvas.height);
		context = canvas.getContext('2d');

		world = box2dUtils.createWorld(context); // box2DWorld
		
		// Créer le "sol" et le "plafond" de notre environnement physique
		ground = box2dUtils.createBox(world, 400, canvasHeight - 10, 400, 10, true, 'ground');
		ceiling = box2dUtils.createBox(world, 400, -5, 400, 1, true, 'ceiling');
		
		// Créer les "murs" de notre environnement physique
		leftWall = box2dUtils.createBox(world, -5, canvasHeight, 1, canvasHeight, true, 'leftWall');
		leftWall = box2dUtils.createBox(world, canvasWidth + 5, canvasHeight, 1, canvasHeight, true, 'leftWall');
		
		// Créer les "box"
		box2dUtils.createBox(world, 320, 300, 10, 100, true, 'box');
		box2dUtils.createBox(world, 620, 300, 10, 200, true, 'box');
		box2dUtils.createBox(world, 250, 0, 40, 40, false, 'box');
		box2dUtils.createBox(world, 450, 0, 100, 100, false, 'box');
		
		// Créer le player
		player = new Player(SCALE);
		player.createPlayer(world, 25, canvasHeight-30, 20);

		// Exécuter le rendu de l'environnement 2d
		window.setInterval(update, 1000 / 60);
		
		// Ajouter le listener de collisions
		addContactListener();
		
		// Ajouter les listeners d'évènements
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		
		// Désactiver les scrollings vertical lors d'un appui sur les touches directionnelles "haut" et "bas"
		document.onkeydown = function(event) {
			return event.keyCode != 38 && event.keyCode != 40;
		}
		
	}

	// Mettre à jour le rendu de l'environnement 2d
	this.update = function() {

		// gérer les interactions
		handleInteractions();
		
        // effectuer les simulations physiques et mettre à jour le canvas
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

	// Gérer les interactions
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
	
	// Déterminer si l'objet physique est le player
	this.isPlayer = function(object) {
		if (object != null && object.GetUserData() != null) {
			return object.GetUserData() == 'player';
		}
	}
	
	// Déterminer si l'objet physique est les pieds du player
	this.isFootPlayer = function(object) {
		if (object != null && object.GetUserData() != null) {
			return object.GetUserData() == 'footPlayer';
		}
	}
	
	// Déterminer si l'objet physique est le sol ou une box
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
		
		// Entrée en contact
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