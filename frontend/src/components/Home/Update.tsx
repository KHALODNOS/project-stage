import Cart3 from "../Cart/Cart3";
import "./style.css";
import useHttp from "../../hooks/usehttp";
import { useEffect, useState } from "react";
import { Novel } from "../../utils/types";
import Loader from "../Loader";
const Update = () => {

  const { sendData, isLoading, errorMessage } = useHttp();
  const [novels, setNovels] = useState<Novel[] | undefined>([]);
  useEffect(() => {
    const fetchPopularNovels = () => {
      sendData<Novel[]>(
        '/getnovels/updated',
        { method: 'GET' },
        (data) => {
          setNovels(data);
          // console.log(data)
        }
      );
    };

    fetchPopularNovels();
  }, [sendData]);

  if (errorMessage) return <p>Error: {errorMessage}</p>;

  return (
    <div className="update containerbg">
      <div className="bar bg-[#1c8b78] ">
        <p className="barp text-slate-100">أخر التحديثات</p>
        {/* <div className="All">
                    <Link to="">إظهار الكل</Link>
                </div> */}
      </div>
      {isLoading ? <Loader smaller={true} /> :
        <div className={`carts grid gap-[15px] grid-cols-[repeat(auto-fit,minmax(260px,max-content))] mx-[30px] my-0 max767:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] ${novels?.length ? '' : 'h-16 flex justify-center items-center'} `}>
          {novels?.length ? novels.map((novel) => (
            <Cart3 novel={novel} />
          )
          ) :
            <p className='text-[#888]'>لم يتم اضافتها بعد</p>
          }
        </div>
      }
    </div>
  );
}

export default Update;
