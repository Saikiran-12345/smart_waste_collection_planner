# Smart Waste Collection Planner - API Reference Manual

This manual provides an in-depth reference for the service layer and generic repository engine powering the Smart Waste Collection Planner.

---

## 1. Repository Engine (`src/repository/repository.ts`)

The generic repository interacts with browser local storage under the namespace `smart-waste-data`.

### Method: `create<Entity>`
Saves a new entity into the database. If no `id` is specified on the entity, a unique key is generated automatically.
```typescript
export function create<Entity extends { id?: string }>(
  typeName: string,
  entity: Omit<Entity, 'id'> & { id?: string }
): Entity;
```

### Method: `readAll<Entity>`
Retrieves all records matching the designated model type.
```typescript
export function readAll<Entity>(typeName: string): Entity[];
```

### Method: `readOne<Entity>`
Retrieves a specific record by its primary key ID.
```typescript
export function readOne<Entity>(typeName: string, id: string): Entity | undefined;
```

### Method: `update<Entity>`
Updates properties on an existing record.
```typescript
export function update<Entity extends { id: string }>(
  typeName: string,
  id: string,
  updates: Partial<Omit<Entity, 'id'>>
): Entity;
```

### Method: `remove`
Deletes a record matching the ID.
```typescript
export function remove(typeName: string, id: string): void;
```

---

## 2. Area Service (`src/services/areaService.ts`)

Exposes administrative zone operations.

- **`create(area)`**: Saves a new area.
- **`getAll()`**: Retrieves all areas.
- **`getById(id)`**: Fetches an area.
- **`update(id, updates)`**: Modifies area parameters.
- **`delete(id)`**: Deletes an area.
- **`getTotalPopulation()`**: Calculates cumulative population.
- **`getStatusCounts()`**: Groups zones by active/inactive status.

---

## 3. Vehicle Service (`src/services/vehicleService.ts`)

Manages the collection vehicle fleet.

- **`create(vehicle)`**: Saves a new vehicle record.
- **`getAll()`**: Returns all vehicles in the database.
- **`getById(id)`**: Finds a vehicle.
- **`update(id, updates)`**: Modifies properties (load, location, status).
- **`delete(id)`**: Removes a vehicle.
- **`getTotalCapacity()`**: Summarizes fleet capacity.
- **`getStatusCounts()`**: Computes breakdown of vehicles by operational status.

---

## 4. Driver Service (`src/services/driverService.ts`)

Manages operators and roster assignments.

- **`getAvailable()`**: Lists drivers who are active and not currently assigned to a route.
- **`assignVehicle(driverId, vehicleId)`**: Links a vehicle to an operator and updates status.
- **`unassignVehicle(driverId)`**: Frees driver roster connection.

---

## 5. Route Service (`src/services/routeService.ts`)

Implements routing algorithms.

- **`computeRoute(startAreaId)`**: Optimized greedy nearest-neighbor solver. Begins at `startAreaId` and repeatedly dispatches the vehicle to the closest unvisited area until all zones are serviced. Returns ordered path and total mileage.

---

## 6. Machine Learning Service (`src/services/mlService.ts`)

Handles forecast computations.

- **`forecastWasteForArea(areaId)`**: Loads regression factors from `model.json` to predict future collection volume based on area population.
