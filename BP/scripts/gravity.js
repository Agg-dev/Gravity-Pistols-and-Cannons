import { world, system } from '@minecraft/server';

const activeIntervals = new Map();
const handAnimationIntervals = new Map();

world.afterEvents.itemStartUse.subscribe(event => {
    const player = event.source;
    const itemId = event.itemStack.typeId;
    const isCannon = itemId === 'agg:gravity_cannon';

    if (itemId !== 'agg:gravity_cannon' && itemId !== 'agg:gravity_pistol') return;

    // Play gun sound
    player.dimension.playSound('agg.ggun', player.location, { volume: 1, pitch: isCannon ? 1 : 1.2 });

    // Hand animation interval
    handAnimationIntervals.set(player.id, system.runInterval(() => {
        const mainhandItem = player.getComponent('equippable')?.getEquipment('Mainhand')?.typeId;
        if (mainhandItem !== 'agg:gravity_cannon' && mainhandItem !== 'agg:gravity_pistol') {
            system.clearRun(handAnimationIntervals.get(player.id));
            handAnimationIntervals.delete(player.id);
            return;
        }
        player.playAnimation('animation.agg.ggun.shake');
    }, 4));

    // Gravity Cannon logic
    if (isCannon) {
        activeIntervals.set(player.id, system.runInterval(() => {
            const view = player.getViewDirection();
            const sneaking = player.isSneaking;
            const velocity = sneaking
                ? `${view.x * 3}_${view.y * 3 + 1.05}_${view.z * 3}`
                : `${view.x * -1.6}_${view.y * -0.6}_${view.z * -1.6}`;
            const mainhandItem = player.getComponent('equippable')?.getEquipment('Mainhand')?.typeId;

            if (mainhandItem !== 'agg:gravity_cannon' && mainhandItem !== 'agg:gravity_pistol') {
                system.clearRun(activeIntervals.get(player.id));
                activeIntervals.delete(player.id);
                return;
            }

            const command = sneaking
                ? 'execute if block ^^^8 air run tp @e[r=8.1,rm=1] ^^^8'
                : 'execute if block ^^^7 air run tp @e[r=7,rm=1] ^^^7';

            player.runCommandAsync(command)
                .then(res => {
                    if (res.successCount === 0) {
                        player.runCommandAsync(`execute positioned ^^^11 as @e[r=4] run scriptevent agg:gg a${velocity}`)
                            .then(r => {
                                if (r.successCount === 0)
                                    player.runCommandAsync(`execute positioned ^^^15 as @e[r=4] run scriptevent agg:gg a${velocity}`);
                            });
                    }
                });
        }, 2));
        return;
    }

    // Gravity Pistol logic
    activeIntervals.set(player.id, system.runInterval(() => {
        const view = player.getViewDirection();
        const velocity = player.isSneaking
            ? `${view.x * 1.2}_${view.y * 2 + 0.5}_${view.z * 1.2}`
            : `${view.x * -0.7}_${view.y * -0.25}_${view.z * -0.7}`;
        const mainhandItem = player.getComponent('equippable')?.getEquipment('Mainhand')?.typeId;

        if (mainhandItem !== 'agg:gravity_cannon' && mainhandItem !== 'agg:gravity_pistol') {
            system.clearRun(activeIntervals.get(player.id));
            activeIntervals.delete(player.id);
            return;
        }

        player.runCommandAsync('execute if block ^^^1.99 air run tp @e[r=1.99,rm=1] ^^^1.9')
            .then(res => {
                if (res.successCount === 0) {
                    player.runCommandAsync(`execute positioned ^^^6 as @e[r=4] run scriptevent agg:gg a${velocity}`)
                        .then(r => {
                            if (r.successCount === 0)
                                player.runCommandAsync(`execute positioned ^^^8 as @e[r=4] run scriptevent agg:gg a${velocity}`);
                        });
                }
            });
    }, 2));
});

// Event: when player stops using an item
world.afterEvents.itemStopUse.subscribe(event => {
    const player = event.source;
    const playerId = player.id;
    const cannonInterval = activeIntervals.get(playerId);
    const animationInterval = handAnimationIntervals.get(playerId);
    const itemId = event.itemStack.typeId;

    if ((itemId !== 'agg:gravity_pistol' && itemId !== 'agg:gravity_cannon') || typeof cannonInterval !== 'number') return;

    system.clearRun(cannonInterval);
    activeIntervals.delete(playerId);

    if (typeof animationInterval === 'number') {
        system.clearRun(animationInterval);
        handAnimationIntervals.delete(playerId);
    }
});

// Event: apply impulse on script event
system.afterEvents.scriptEventReceive.subscribe(event => {
    if (event.id !== 'agg:gg') return;

    const [xVel, yVel, zVel] = event.message.slice(1).split('_');
    const player = event.sourceEntity;
    const { x, y, z } = player.location;

    player.applyImpulse({ x: +xVel, y: +yVel, z: +zVel });
    player.dimension.spawnParticle('agg:ggun', { x, y: y + 1, z });
});
