interface msg {
  type?: string;
  title: string;
  color: any;
  rawsvg: string;
  x?: number;
  y?: number;
  favourites?: any[];
}

function findNodeAtPoint(parent: ChildrenMixin, x: number, y: number): SceneNode | null {
  for (let i = parent.children.length - 1; i >= 0; i--) {
    const child = parent.children[i] as SceneNode;
    const bounds = child.absoluteBoundingBox;
    if (!bounds) continue;
    if (x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height) {
      if ('children' in child) {
        const deeper = findNodeAtPoint(child as unknown as ChildrenMixin, x, y);
        if (deeper) return deeper;
      }
      return child;
    }
  }
  return null;
}

startUI();

// @ts-ignore
async function startUI() {
  figma.showUI(__html__, { 
    width: 350,
    height: 610,
    themeColors: true
  });
  figma.clientStorage.getAsync('faves').then(faves => {
    if(faves) figma.ui.postMessage(faves);
  }).catch(err=>{
    console.log('error: ', err)
  });
  figma.ui.onmessage = async (msg) => {
    switch (msg.type) {
      case 'create-color':
        if (figma.currentPage.selection.length > 0) {
          const color = msg.color;
          const r = color.r / 255;
          const g = color.g / 255;
          const b = color.b / 255;

          for (const node of figma.currentPage.selection) {
            if ('fills' in node) {
              node.fills = [{ type: 'SOLID', color: { r, g, b } }];
            }
          }
        } else {
          figma.notify('Please select something');
        }

        break;
      case 'create-icon':
        const nodes: SceneNode[] = [];
        const node = figma.createNodeFromSvg(msg.rawsvg);
        const svg = node.children[0] as VectorNode;
        let buffer = 10;

        // svg.name = 'container';
        svg.name = msg.title;
        nodes.push(svg);

        figma.currentPage.appendChild(svg);
        svg.lockAspectRatio();
        svg.x = figma.viewport.center.x;
        svg.y = figma.viewport.center.y;
        if (figma.currentPage.selection.length > 0) {
          svg.x = figma.currentPage.selection[0].width + figma.currentPage.selection[0].x + buffer;
          svg.y = figma.currentPage.selection[0].y;
        }
        node.remove();
        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);

        break;
      case 'get-faves':
        const getS = await figma.clientStorage.getAsync('faves');
        figma.ui.postMessage(getS);
        break;
      case 'update-faves':
        if (msg.favourites) {
          await figma.clientStorage.setAsync('faves', msg.favourites);
          figma.ui.postMessage({ type: 'init-faves', data: msg.favourites });
        }
        break;
      case 'create-icon-drop':
        const dropNodes: SceneNode[] = [];
        const dropNode = figma.createNodeFromSvg(msg.rawsvg);
        const dropSvg = dropNode.children[0] as VectorNode;

        dropSvg.name = msg.title;
        dropNodes.push(dropSvg);

        figma.currentPage.appendChild(dropSvg);
        dropSvg.lockAspectRatio();

        // Place the icon exactly at the drop coordinates!
        if (msg.x !== undefined && msg.y !== undefined) {
          dropSvg.x = msg.x;
          dropSvg.y = msg.y;
        }

        dropNode.remove();
        figma.currentPage.selection = dropNodes;
        break;
      case 'cancel':
        figma.closePlugin();
        break;
    }
  };
  figma.on('drop', (event: DropEvent) => {
    const { dropMetadata } = event;

    if (dropMetadata && dropMetadata.svgUrl) {
      if (dropMetadata.isColorDrop) {
        const target = findNodeAtPoint(figma.currentPage, event.absoluteX, event.absoluteY);
        if (target && 'fills' in target && target.type !== 'TEXT') {
          const hex: string = dropMetadata.hex;
          const r = parseInt(hex.substring(0, 2), 16) / 255;
          const g = parseInt(hex.substring(2, 4), 16) / 255;
          const b = parseInt(hex.substring(4, 6), 16) / 255;
          target.fills = [{ type: 'SOLID', color: { r, g, b } }];
        } else {
          figma.notify('Color fill must be applied to shapes or frames', { error: true });
        }
        return false;
      }

      figma.ui.postMessage({
        type: 'fetch-and-place',
        svgUrl: dropMetadata.svgUrl,
        title: dropMetadata.title,
        x: event.absoluteX,
        y: event.absoluteY
      });
      return false;
    }
    return true;
  });
}
