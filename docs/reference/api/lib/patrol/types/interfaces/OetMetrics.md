[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/patrol/types](../README.md) / OetMetrics

# Interface: OetMetrics

Real-time and debrief judgment metrics evaluating operator control during toboggan descent.

## Properties

### abruptDirectionChanges

> **abruptDirectionChanges**: `number`

Count of harsh or sudden lateral direction changes.

***

### boundaryViolations

> **boundaryViolations**: `number`

Count of times the sled crossed outside the designated trail boundaries.

***

### collisions

> **collisions**: `number`

Count of physical collisions with trees, rocks, or terrain obstacles.

***

### controlledStops

> **controlledStops**: `number`

Count of smooth, controlled complete stops performed on the fall line.

***

### excessiveSpeedTime

> **excessiveSpeedTime**: `number`

Time spent exceeding safe descent speed threshold in seconds.

***

### judgmentScore

> **judgmentScore**: `number`

Overall OET judgment score rewarding control over speed (0 - 100).

***

### routeEfficiency

> **routeEfficiency**: `number`

Route adherence and gate traversal efficiency rating (0 - 100).
