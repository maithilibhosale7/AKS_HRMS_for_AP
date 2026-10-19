export function clickOutside(node, callback) {
    const handle = (event) => {
        if (!node.contains(event.target)) {
            if (typeof callback === 'function') callback(event);
        }
    };
    document.addEventListener('click', handle, true);
    return {
        destroy() {
            document.removeEventListener('click', handle, true);
        }
    };
}
