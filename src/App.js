import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const getImg = async (imgNumber) => {
  const data = await fetch(
    `https://jsonplaceholder.typicode.com/photos/${imgNumber}`
  )
    .then((response) => response.json())
    .then((data) => data);
  return data;
};

const App = () => {
  const ref = useRef(null);
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  const addMoveable = async () => {
    // Create a new moveable component and add it to the array

    // Sets up item image and a color in case image is invalid
    const COLORS = ["red", "blue", "yellow", "green", "purple"];
    const image = await getImg(Math.floor(Math.random() * 5001));

    // Updates moveableComponents state with the new moveable item
    const newId = Math.floor(Math.random() * Date.now());

    setMoveableComponents([
      ...moveableComponents,
      {
        id: newId,
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
        image,
      },
    ]);
  };

  const removeLastMoveable = () => {
    setMoveableComponents((prevMoveables) =>
      prevMoveables.filter((moveable, i) => i < (prevMoveables.length - 1))
    );
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main ref={ref} style={{ height: "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <button onClick={removeLastMoveable}>Remove Last Moveable1</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  image,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
      image,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${newWidth}px`;
    ref.current.style.height = `${newHeight}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
        image,
      },
      true
    );
  };

  const handleDrag = (e) => {
    let newTop = e.top;
    let newLeft = e.left;

    // Calcula nuevas posiciones en caso de que la nueva exceda las dimensiones del 'parent'
    if (e.left + width > parentBounds.width) {
      newLeft = parentBounds.width - width;
    }
    if (e.left < 0) {
      newLeft = 0;
    }
    if (e.top + height > parentBounds.height) {
      newTop = parentBounds.height - height;
    }
    if (e.top < 0) {
      newTop = 0;
    }

    // Actualiza el componente
    updateMoveable(id, {
      top: newTop,
      left: newLeft,
      width,
      height,
      color,
      image,
    });
  };

  return (
    <>
      {/* <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
        }}
        onClick={() => setSelected(id)}
      /> */}

      <img
        src={image?.url}
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
        }}
        onClick={() => setSelected(id)}
        alt={image?.title}
      />

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={handleDrag}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
