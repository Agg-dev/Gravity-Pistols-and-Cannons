import { world, system } from '@minecraft/server';

// Maps to track active intervals for each player
const activeGravityIntervals = new Map();
const activeShakeIntervals = new Map();

// Handle when player starts using gravity weapons
world.afterEvents.itemStartUse.subscribe(event => {
    const player = event.source;
    const itemType = event.itemStack.typeId;
    
    // Check if item is a gravity weapon
    if (itemType !== 'agg:gravity_cannon' && 
        itemType !== 'agg:gravity_pistol' && 
        itemType !== 'agg:omega_gravity_shotgun') return;
    
    // Play weapon sound
    const pitch = itemType === 'agg:gravity_cannon' ? 1 : 1.2;
    player.dimension.playSound('agg.ggun', player.location, { volume: 1, pitch });
    
    // Start shake animation
    activeShakeIntervals.set(player.id, system.runInterval(() => {
        const currentItem = player.getComponent('equippable')?.getEquipment('Mainhand')?.typeId;
        
        // Stop if no longer holding gravity weapon
        if (currentItem !== 'agg:gravity_cannon' && 
            currentItem !== 'agg:gravity_pistol' && 
            currentItem !== 'agg:omega_gravity_shotgun') {
            system.clearRun(activeShakeIntervals.get(player.id));
            activeShakeIntervals.delete(player.id);
            return;
        }
        
        player.playAnimation('animation.agg.ggun.shake');
    }, 4));
    
    // Handle gravity cannon
    if (itemType === 'agg:gravity_cannon') {
        activeGravityIntervals.set(player.id, system.runInterval(() => {
            const viewDirection = player.getViewDirection();
            const isSneaking = player.isSneaking;
            
            // Calculate force vector based on sneaking state
            const forceVector = isSneaking 
                ? `${viewDirection.x * 3}_${viewDirection.y * 3 + 1.05}_${viewDirection.z * 3}`
                : `${viewDirection.x * -1.6}_${viewDirection.y * -0.6}_${viewDirection.z * -1.6}`;
            
            const currentItem = player.getComponent('equippable')?.getEquipment('Mainhand')?.typeId;
            
            // Stop if no longer holding gravity weapon
            if (currentItem !== 'agg:gravity_cannon' && 
                currentItem !== 'agg:gravity_pistol' && 
                currentItem !== 'agg:omega_gravity_shotgun') {
                system.clearRun(activeGravityIntervals.get(player.id));
                activeGravityIntervals.delete(player.id);
                return;
            }
            
            // Apply gravity effect with fallback positions
            const primaryCommand = isSneaking 
                ? 'execute if block ^^^8 air run tp @e[r=8.1,rm=1] ^^^8'
                : 'execute if block ^^^7 air run tp @e[r=7,rm=1] ^^^7';
            
            (isSneaking 
                ? player.runCommandAsync(primaryCommand) && Promise.resolve({successCount: 0})
                : player.runCommandAsync(primaryCommand)
            ).then(result => {
                if (result.successCount === 0) {
                    player.runCommandAsync(`execute positioned ^^^11 as @e[r=4] run scriptevent agg:gg a${forceVector}`)
                        .then(result => {
                            if (result.successCount === 0) {
                                player.runCommandAsync(`execute positioned ^^^15 as @e[r=4] run scriptevent agg:gg a${forceVector}`);
                            }
                        });
                }
            });
        }, 2));
        return;
    }
    
    // Handle omega gravity shotgun
    if (itemType === 'agg:omega_gravity_shotgun') {
        activeGravityIntervals.set(player.id, system.runInterval(() => {
            const viewDirection = player.getViewDirection();
            const isSneaking = player.isSneaking;
            
            // Calculate stronger force vector for shotgun
            const forceVector = isSneaking 
                ? `${viewDirection.x * 8}_${viewDirection.y * 8 + 2}_${viewDirection.z * 8}`
                : `${viewDirection.x * -3}_${viewDirection.y * -1.5}_${viewDirection.z * -3}`;
            
            const currentItem = player.getComponent('equippable')?.getEquipment('Mainhand')?.typeId;
            
            // Stop if no longer holding gravity weapon
            if (currentItem !== 'agg:gravity_cannon' && 
                currentItem !== 'agg:gravity_pistol' && 
                currentItem !== 'agg:omega_gravity_shotgun') {
                system.clearRun(activeGravityIntervals.get(player.id));
                activeGravityIntervals.delete(player.id);
                return;
            }
            
            // Apply stronger gravity effect with longer range
            const primaryCommand = isSneaking 
                ? 'execute if block ^^^15 air run tp @e[r=15.1,rm=1] ^^^15'
                : 'execute if block ^^^14 air run tp @e[r=14,rm=1] ^^^14';
            
            (isSneaking 
                ? player.runCommandAsync(primaryCommand) && Promise.resolve({successCount: 0})
                : player.runCommandAsync(primaryCommand)
            ).then(result => {
                if (result.successCount === 0) {
                    player.runCommandAsync(`execute positioned ^^^19 as @e[r=5] run scriptevent agg:gg b${forceVector}`)
                        .then(result => {
                            if (result.successCount === 0) {
                                player.runCommandAsync(`execute positioned ^^^29 as @e[r=5] run scriptevent agg:gg b${forceVector}`);
                            }
                        });
                }
            });
        }, 2));
        return;
    }
    
    // Handle gravity pistol
    if (itemType === 'agg:gravity_pistol') {
        activeGravityIntervals.set(player.id, system.runInterval(() => {
            const viewDirection = player.getViewDirection();
            
            // Calculate weaker force vector for pistol
            const forceVector = player.isSneaking 
                ? `${viewDirection.x * 1.2}_${viewDirection.y * 2 + 0.5}_${viewDirection.z * 1.2}`
                : `${viewDirection.x * -0.7}_${viewDirection.y * -0.25}_${viewDirection.z * -0.7}`;
            
            const currentItem = player.getComponent('equippable')?.getEquipment('Mainhand')?.typeId;
            
            // Stop if no longer holding gravity weapon
            if (currentItem !== 'agg:gravity_cannon' && 
                currentItem !== 'agg:gravity_pistol' && 
                currentItem !== 'agg:omega_gravity_shotgun') {
                system.clearRun(activeGravityIntervals.get(player.id));
                activeGravityIntervals.delete(player.id);
                return;
            }
            
            // Apply weaker gravity effect with shorter range
            player.runCommandAsync('execute if block ^^^1.99 air run tp @e[r=1.99,rm=1] ^^^1.9')
                .then(result => {
                    if (result.successCount === 0) {
                        player.runCommandAsync(`execute positioned ^^^6 as @e[r=4] run scriptevent agg:gg a${forceVector}`)
                            .then(result => {
                                if (result.successCount === 0) {
                                    player.runCommandAsync(`execute positioned ^^^8 as @e[r=4] run scriptevent agg:gg a${forceVector}`);
                                }
                            });
                    }
                });
        }, 2));
    }
});

// Handle when player stops using gravity weapons
world.afterEvents.itemStopUse.subscribe(event => {
    const player = event.source;
    const playerId = player.id;
    const gravityInterval = activeGravityIntervals.get(playerId);
    const shakeInterval = activeShakeIntervals.get(playerId);
    const itemType = event.itemStack.typeId;
    
    // Check if item was a gravity weapon and had an active interval
    if ((itemType !== 'agg:gravity_pistol' && 
         itemType !== 'agg:gravity_cannon' && 
         itemType !== 'agg:omega_gravity_shotgun') || 
        typeof gravityInterval !== 'number') return;
    
    // Clear gravity effect interval
    system.clearRun(gravityInterval);
    activeGravityIntervals.delete(playerId);
    
    // Clear shake animation interval if it exists
    if (typeof shakeInterval === 'number') {
        system.clearRun(shakeInterval);
        activeShakeIntervals.delete(playerId);
    }
});

// Handle gravity force application via script events
system.afterEvents.scriptEventReceive.subscribe(event => {
    if (event.id !== 'agg:gg') return;
    
    const message = event.message;
    const [forceX, forceY, forceZ] = message.slice(1).split('_');
    const entity = event.sourceEntity;
    const entityLocation = entity.location;
    
    // Apply impulse force to entity
    entity.applyImpulse({ 
        x: +forceX, 
        y: +forceY, 
        z: +forceZ 
    });
    
    // Spawn appropriate particle effect
    const particleType = message[0] === 'a' ? 'agg:ggun' : 'agg:ggun2';
    entity.dimension.spawnParticle(particleType, {
        x: entityLocation.x,
        y: entityLocation.y + 1,
        z: entityLocation.z
    });
});
