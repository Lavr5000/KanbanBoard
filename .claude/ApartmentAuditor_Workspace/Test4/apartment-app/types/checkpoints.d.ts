declare module '*.json' {
  const value: any;
  export default value;
}

declare module './constants/checkpoints_v2.1.json' {
  const checkpoints: import('./database.types').CheckpointsDatabase;
  export default checkpoints;
}