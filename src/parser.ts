export interface LuaInstance {
  id: string;
  className: string;
  properties: Record<string, string>;
  children: LuaInstance[];
  parentId: string | null;
}

export function parseLuaUI(code: string): LuaInstance[] {
  const instances: Record<string, LuaInstance> = {};
  
  // 1. Find all Instance.new
  // Matches: local myFrame = Instance.new("Frame")
  // Or: myFrame = Instance.new("Frame")
  const newRegex = /(?:local\s+)?([a-zA-Z0-9_]+)\s*=\s*Instance\.new\(\s*"([a-zA-Z0-9_]+)"\s*(?:,\s*([a-zA-Z0-9_]+))?\s*\)/g;
  
  let match;
  while ((match = newRegex.exec(code)) !== null) {
    const [_, id, className, parentId] = match;
    instances[id] = {
      id,
      className,
      properties: {},
      children: [],
      parentId: parentId || null
    };
  }

  // 2. Find all property assignments
  // Matches: myFrame.Size = UDim2.new(1, 0, 1, 0)
  // Matches: myFrame.Text = "Hello"
  // We need a somewhat lenient regex for the value
  const propRegex = /([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s*=\s*(.+)/g;
  while ((match = propRegex.exec(code)) !== null) {
    let [_, id, prop, value] = match;
    value = value.trim();
    // remove trailing comments or semicolons if any, simplistically
    value = value.replace(/;$/, '').replace(/--.*$/, '').trim();
    
    if (instances[id]) {
      if (prop === "Parent") {
        instances[id].parentId = value;
      } else {
        instances[id].properties[prop] = value;
      }
    }
  }

  // 3. Build tree
  const rootInstances: LuaInstance[] = [];
  
  Object.values(instances).forEach(instance => {
    if (instance.parentId && instances[instance.parentId]) {
      instances[instance.parentId].children.push(instance);
    } else {
      // If parent isn't found in our parsed instances (like parent is 'game.StarterGui'), 
      // we consider it a root instance.
      rootInstances.push(instance);
    }
  });

  return rootInstances;
}
