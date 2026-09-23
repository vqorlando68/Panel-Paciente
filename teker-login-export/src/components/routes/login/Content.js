"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";

import { idTypes } from "@/lib/staticData";
import { setUserData } from "@/lib/redux/features/userData";

import useToastFeedback from "@/hooks/useToastFeedback";

import { userByIdentification } from "@/app/actions";

import Select from "@/components/custom/inputs/Select";
import Input from "@/components/custom/inputs/Input";
import { Button } from "@/components/custom/Button";

const Content = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setToastAlert } = useToastFeedback();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const { idType, id } = data;

    const { errorCode, errorMsg, ...resp } = await userByIdentification({
      idType,
      id: id.includes("t") ? id.slice(0, -1) : id,
      login: !id.includes("t"),
    });

    if (errorCode === 0) {
      dispatch(setUserData({ ...resp }));

      setCookie("tkr_usr_id", resp.accessData.id_usuario);

      router.push("/login/validar");

      setTimeout(() => {
        setIsSubmitting(false);
      }, 5000);
    } else {
      setIsSubmitting(false);
      setToastAlert({
        message: errorMsg,
        type: "error",
      });
    }
  };

  return (
    <main className=" relative flex flex-col items-center justify-center gap-8 px-4 py-20">
      <div className=" max-w-xl w-full space-y-8">
        <div className=" w-full flex flex-col ">
          <div className="text-Text_Seguridad font-semibold">Mi cuenta</div>
          <div className=" text-4xl text-Text_Primary font-bold">
            Ingrese con su identificación
          </div>
        </div>

        <form className=" w-full space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className=" w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* doc type */}
            <Select
              id="idType"
              name="idType"
              placeholder="Tipo de documento"
              required
              register={register}
              options={idTypes()}
              errors={errors}
            />
            {/* doc type */}

            {/* doc num */}
            <Input
              type="text"
              id="id"
              name="id"
              placeholder="Número de documento"
              control={control}
              required
              errors={errors}
              registerOptions={{
                pattern: {
                  value: /^[A-Z0-9]+$/i,
                  message: "Solo se permiten letras y números. Sin espacios.",
                },
                minLength: {
                  value: 5,
                  message: "Mínimo 5 caracteres",
                },
                maxLength: {
                  value: 16,
                  message: "Máximo 16 caracteres",
                },
              }}
            />
            {/* doc num */}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="text-white bg-sky-500 max-h-18 w-full py-4 px-3 sm:px-6 text-base text-center font-semibold rounded-2xl disabled:opacity-50"
          >
            {isSubmitting ? "Validando..." : "Continuar"}
          </button>
        </form>

        <div className=" space-y-3">
          <p className=" text-center">
            ¿No tienes cuenta? {"  "}
            <Link
              href="/registro"
              className=" text-Button_Text_Primary font-semibold underline cursor-pointer"
            >
              Regístrate aquí
            </Link>
          </p>
          <p className=" text-center">
            ¿Eres profesional? {"  "}
            <Link
              href="/registro-profesional"
              className=" text-Button_Text_Primary font-semibold underline cursor-pointer"
            >
              Regístrate aquí
            </Link>
          </p>
          <p className=" text-center">
            ¿Aliado? {"  "}
            <Link
              href="/empresas/registro"
              className=" text-Button_Text_Primary font-semibold underline cursor-pointer"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Content;
