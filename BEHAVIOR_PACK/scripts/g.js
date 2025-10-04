import { world, system, GameMode, ItemStack, EquipmentSlot } from '@minecraft/server';

// ========================================
// STATE MANAGEMENT
// ========================================

// Maps to track active weapon states per player
const activeIntervalIds = new Map(); // Tracks main firing interval IDs
const shakeAnimationIds = new Map(); // Tracks shake animation interval IDs
const weaponEnergyLevels = new Map(); // Tracks energy levels per weapon instance

// ========================================
// CONSTANTS & PATTERNS
// ========================================

// Regex to extract weapon name from typeId (e.g., "agg:gravity_pistol" -> "pistol")
const WEAPON_NAME_PATTERN = /[^:_]+$/;

// Regex to match first word character for capitalization
const FIRST_CHAR_PATTERN = /^\w/;

// Regex to validate gravity weapon typeIds
const GRAVITY_WEAPON_PATTERN = /^agg:(gravity_cannon|gravity_pistol|omega_gravity_shotgun)$/;

// Item stacks for equipment manipulation
const AIR_ITEM = new ItemStack('minecraft:air', 1);
const DEGRADED_GUN_ITEM = new ItemStack('agg:gravity_gun_degraded', 1);

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Cleans up all active states for a player
 * @param {string} playerId - The player's unique identifier
 * @param {string} weaponKey - The combined player+weapon key for energy tracking
 */
const cleanupPlayerState = (playerId, weaponKey) => {
    // Clear main firing interval
    if (activeIntervalIds.has(playerId)) {
        system.clearRun(activeIntervalIds.get(playerId));
        activeIntervalIds.delete(playerId);
    }
    
    // Clear shake animation interval
    if (shakeAnimationIds.has(playerId)) {
        system.clearRun(shakeAnimationIds.get(playerId));
        shakeAnimationIds.delete(playerId);
    }
    
    // Clear energy level tracking
    weaponEnergyLevels.delete(weaponKey);
};

// ========================================
// EVENT HANDLERS - PLAYER CLEANUP
// ========================================

// Clean up state when player is leaving
world.beforeEvents.playerLeave.subscribe(event => {
    cleanupPlayerState(event.player.id);
});

// Clean up state after player has left
world.afterEvents.playerLeave.subscribe(event => {
    cleanupPlayerState(event.playerId);
});

// Clean up state when player dies
world.afterEvents.entityDie.subscribe(event => {
    const { typeId, id } = event.deadEntity;
    if (typeId === 'minecraft:player') {
        cleanupPlayerState(id);
    }
});

// ========================================
// EVENT HANDLER - WEAPON RECHARGING
// ========================================

world.afterEvents.entityHitBlock.subscribe(event => {
    const player = event.damagingEntity;
    const equipmentComponent = player.getComponent('equippable');
    const offhandItem = equipmentComponent.getEquipment('Offhand');
    const mainhandItem = equipmentComponent.getEquipment('Mainhand');
    const mainhandTypeId = mainhandItem?.typeId;
    let maxEnergy;
    
    // Check if player has gravity cell in offhand and gravity weapon in mainhand
    if (offhandItem?.typeId !== 'agg:gravity_cell' || !GRAVITY_WEAPON_PATTERN.test(mainhandTypeId)) {
        return;
    }
    
    // Generate unique key for this player+weapon combination
    const weaponKey = player.id + mainhandTypeId;
    const currentEnergy = weaponEnergyLevels.get(weaponKey) ?? null;
    const newEnergy = currentEnergy + 100;
    
    // Determine max energy based on weapon type
    switch (mainhandTypeId) {
        case 'agg:gravity_cannon':
            maxEnergy = 800;
            break;
        case 'agg:omega_gravity_shotgun':
            maxEnergy = 1600;
            break;
        case 'agg:gravity_pistol':
            maxEnergy = 400;
            break;
    }
    
    // If weapon is already at full energy, notify and return
    if (!currentEnergy) {
        player.sendMessage(`Energy of Gravity ${mainhandTypeId.match(WEAPON_NAME_PATTERN)[0].replace(FIRST_CHAR_PATTERN, char => char.toUpperCase())} is full`);
        return;
    }
    
    // Consume gravity cell from offhand
    if (offhandItem.amount > 1) {
        offhandItem.amount -= 1;
    } else {
        offhandItem = AIR_ITEM;
    }
    equipmentComponent.setEquipment('Offhand', offhandItem);
    
    // Update energy level (capped at max)
    if (newEnergy < maxEnergy) {
        weaponEnergyLevels.set(weaponKey, newEnergy);
    } else {
        weaponEnergyLevels.delete(weaponKey);
    }
    
    // Play recharge sound and show energy percentage
    player.playSound('random.anvil_use');
    player.onScreenDisplay.setActionBar(((Math.min(newEnergy, maxEnergy) / maxEnergy) * 100).toFixed(2) + '% \uF300');
}, { entityTypes: ["minecraft:player"] });

// ========================================
// EVENT HANDLER - WEAPON STOP USE
// ========================================

world.afterEvents.itemStopUse.subscribe(event => {
    const player = event.source;
    const playerId = player.id;
    const firingIntervalId = activeIntervalIds.get(playerId);
    const shakeIntervalId = shakeAnimationIds.get(playerId);
    const itemTypeId = event.itemStack.typeId;
    
    // Check if stopped item is a gravity weapon with active interval
    if ((itemTypeId !== 'agg:gravity_pistol' && itemTypeId !== 'agg:gravity_cannon' && itemTypeId !== 'agg:omega_gravity_shotgun') || typeof firingIntervalId !== 'number') {
        return;
    }
    
    // Clear firing interval
    system.clearRun(firingIntervalId);
    activeIntervalIds.delete(playerId);
    
    // Clear shake animation if active
    if (typeof shakeIntervalId === 'number') {
        system.clearRun(shakeIntervalId);
        shakeAnimationIds.delete(playerId);
    }
});

// ========================================
// EVENT HANDLER - WEAPON START USE
// ========================================

world.afterEvents.itemStartUse.subscribe(event => {
    const player = event.source;
    const dimension = player.dimension;
    const playerId = player.id;
    const itemTypeId = event.itemStack.typeId;
    const weaponKey = playerId + itemTypeId;
    
    // Validate gravity weapon usage by player
    if (!GRAVITY_WEAPON_PATTERN.test(itemTypeId) || player.typeId !== 'minecraft:player') {
        return;
    }
    
    // Play weapon activation sound
    player.dimension.playSound('agg.ggun', player.location, {
        volume: 1,
        pitch: itemTypeId === 'agg:gravity_cannon' ? 1 : 1.2
    });
    
    // Start shake animation interval
    shakeAnimationIds.set(playerId, system.runInterval(() => {
        // Stop animation if weapon is no longer equipped
        if (!GRAVITY_WEAPON_PATTERN.test(player.getComponent('equippable')?.getEquipment('Mainhand')?.typeId)) {
            system.clearRun(shakeAnimationIds.get(playerId));
            shakeAnimationIds.delete(playerId);
            return;
        }
        player.playAnimation('animation.agg.ggun.shake');
    }, 4));
    
    // Weapon-specific configuration
    let maxEnergy;
    let gameMode;
    let weaponRange = {};
    let impulseStrength;
    const { x: playerX, y: playerY, z: playerZ } = player.location;
    const { x: dirX, y: dirY, z: dirZ } = player.getViewDirection();
    
    switch (itemTypeId) {
        case 'agg:gravity_cannon':
            weaponRange = 11;
            impulseStrength = 3;
            maxEnergy = 800;
            break;
        case 'agg:omega_gravity_shotgun':
            weaponRange = 16;
            impulseStrength = 5;
            maxEnergy = 1600;
            break;
        case 'agg:gravity_pistol':
            weaponRange = 7;
            impulseStrength = 2;
            maxEnergy = 400;
            break;
    }
    
    // Target search configuration
    const targetSearchOptions = {
        maxDistance: 4.5,
        location: {
            x: playerX + (dirX * weaponRange),
            y: playerY + (dirY * weaponRange),
            z: playerZ + (dirZ * weaponRange)
        }
    };
    
    const particleSpawnRange = weaponRange - 2;
    const isSingleBeam = itemTypeId !== 'agg:omega_gravity_shotgun';
    const teleportMaxDistance = isSingleBeam ? (weaponRange * 0.85) : (weaponRange * 0.95);
    
    // Start main firing interval
    activeIntervalIds.set(playerId, system.runInterval(() => {
        const equipmentComponent = player.getComponent('equippable');
        const mainhandItem = equipmentComponent.getEquipment('Mainhand');
        
        // Stop if weapon is no longer valid
        if (!GRAVITY_WEAPON_PATTERN.test(mainhandItem?.typeId) || !player.isValid()) {
            system.clearRun(activeIntervalIds.get(playerId));
            activeIntervalIds.delete(playerId);
            weaponEnergyLevels.delete(weaponKey);
            return;
        }
        
        // Update target location based on current view direction
        const { x: playerX, y: playerY, z: playerZ } = player.location;
        const { x: dirX, y: dirY, z: dirZ } = player.getViewDirection();
        
        targetSearchOptions.location.x = playerX + (dirX * weaponRange);
        targetSearchOptions.location.y = playerY + (dirY * weaponRange);
        targetSearchOptions.location.z = playerZ + (dirZ * weaponRange);
        
        const particleX = playerX + (dirX * particleSpawnRange);
        const particleY = playerY + (dirY * particleSpawnRange);
        const particleZ = playerZ + (dirZ * particleSpawnRange);
        
        const isSneaking = player.isSneaking;
        const impulseMultiplier = isSneaking ? impulseStrength : impulseStrength * -1;
        const halfImpulse = impulseMultiplier * 0.5;
        
        const targetEntities = dimension.getEntities(targetSearchOptions);
        const remainingEnergy = weaponEnergyLevels.get(weaponKey) ?? maxEnergy;
        
        // Degrade weapon if out of energy
        if (remainingEnergy < 1) {
            player.playSound('random.break');
            equipmentComponent.setEquipment('Mainhand', DEGRADED_GUN_ITEM);
            system.run(() => cleanupPlayerState(playerId, weaponKey));
            return;
        }
        
        // Display energy level with color coding
        player.onScreenDisplay.setActionBar(`§${remainingEnergy <= 50 ? 'c' : remainingEnergy <= 100 ? 'g' : 'b'}${((remainingEnergy / maxEnergy) * 100).toFixed(2)}%§f\uF300§r`);
        
        if (!targetEntities.length) return;
        
        // Process each target entity
        for (const targetEntity of targetEntities) {
            // Skip self and creative/spectator players
            if (targetEntity.id === playerId || (gameMode = targetEntity.getGameMode?.()) === 'creative' || gameMode === 'spectator') continue;
            
            // Consume energy
            weaponEnergyLevels.set(weaponKey, remainingEnergy - 1);
            
            const targetLocation = targetEntity.location;
            const teleportPosition = {
                x: particleX - 0.1,
                y: particleY - 0.1,
                z: particleZ - 0.1
            };
            
            // teleport-lock to hold if close enough and safe
            if (!isSneaking && Math.max(Math.abs(playerX - targetLocation.x), Math.abs(playerZ - targetLocation.z)) < teleportMaxDistance) {
                if (dimension.getBlock(teleportPosition)?.typeId === 'minecraft:air') {
                    targetEntity.teleport(teleportPosition);
                }
            } else {
                // Push/pull mode: apply impulse
                try {
                    targetEntity.applyImpulse({
                        x: dirX * halfImpulse,
                        y: dirY * halfImpulse,
                        z: dirZ * halfImpulse
                    });
                } catch (_) {
                    // applyImpulse failed, use applyKnockback
                    targetEntity.applyKnockback(dirX, dirZ, impulseMultiplier, dirY * impulseMultiplier);
                }
            }
            
            // Spawn particle effect at target
            dimension.spawnParticle(isSingleBeam ? 'agg:ggun' : 'agg:ggun2', targetLocation);
        }
    }, 2));
});