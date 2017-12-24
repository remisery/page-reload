class Session {
  constructor() {
    this.cache = {};
  }

  set(id, data) {
    return this.cache[id] = data;
  }

  get(id) {
    if (this.has(id)) {
      return this.cache[id];
    } else {
      return null;
    }
  }

  has(id) {
    return (id in this.cache);
  }

}
