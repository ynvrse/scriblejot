import notFoundGif from './404.gif';

function NotFound() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <img src={notFoundGif} alt="Not Found" className="w-1/2" />
    </div>
  );
}

export default NotFound;