"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { setSessionCookie, loginAction, regLogAction } from "@/app/actions";

import tkrAxiosInstance from "@/lib/axios/axiosInstance";
import { updateUserData } from "@/lib/redux/features/userData";

import useToastFeedback from "@/hooks/useToastFeedback";

import { Button } from "@/components/custom/Button";
import PinInput from "@/components/custom/form/PinInput";
import { configByRole } from "@/lib/staticData";
import { maskInformation } from "@/lib/utils";

// export const metadata = {
//   title: "Validar ingreso | TeKer"
// };

const logsIdByRole = {
  2: { logId: 5, title: "Ingreso Coordinador" },
  3: { logId: 3, title: "Ingreso Paciente" },
  4: { logId: 4, title: "Ingreso Profesional" },
  7: { logId: 6, title: "Ingreso Coordinador Aliado" },
  8: { logId: 7, title: "Ingreso Administrador Aliado" },
  9: { logId: 9, title: "Ingreso Corredor" },
  11: { logId: 11, title: "Ingreso Coordinador Riesgo" },
  12: { logId: 12, title: "Ingreso Coordinador Riesgo" },
};

export default function Page() {
  const dispatch = useDispatch();

  const { countryData, usrData } = useSelector((state) => state.userData);
  const { currentDomainData } = countryData || {};
  const { id, idType, accessData } = usrData || {};
  const router = useRouter();

  const { setToastAlert } = useToastFeedback();

  const pinLength = 4;
  const [codeValues, setCodeValues] = useState(Array(pinLength).fill(""));
  const [seconds, setSeconds] = useState(90);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const validatePin = async () => {
    if (isVerifying) return;

    const pinCode = codeValues.join("");

    if (pinCode.length === pinLength) {
      setIsVerifying(true);
      try {
        const { accessId, roleId, id_usuario } = accessData;
        const resp = await loginAction({
          roleId,
          accessId,
          id_usuario,
          id,
          idType,
          code: pinCode,
        });

        const { errorCode, errorMsg, ...rest } = resp;

        if (errorCode === 0) {
          await setSessionCookie(
            { ...usrData, ...rest },
            rest.accessData.ID_USUARIO,
            roleId || 3,
          );

          dispatch(updateUserData({ ...rest }));

          await regLogAction({
            id_log_medicion: logsIdByRole[roleId || 3].logId,
            id_acceso: accessId,
            id_usuario: rest.accessData.ID_USUARIO,
            id_aplicacion: configByRole[roleId || 3].appId,
          });

          router.push(`/app/${configByRole[roleId || 3].mainRoute}`);
        } else {
          setToastAlert({
            message: errorMsg,
            type: "error",
          });
          setCodeValues(Array(pinLength).fill(""));
          setIsVerifying(false);
        }
      } catch (error) {
        setIsVerifying(false);
        throw error;
      }
    } else {
      setToastAlert({
        message: "Por favor ingrese el código completo",
        type: "error",
      });
    }
  };

  const handleResend = async () => {
    await tkrAxiosInstance(
      currentDomainData?.origin,
      "/user/code/generate",
      "post",
      {
        id: accessData.accessId,
      },
    );

    setSeconds(90);
  };

  return (
    <main className=" relative flex flex-col items-center justify-center gap-6 px-4 py-20 max-w-xl w-full mx-auto">
      <div className=" flex flex-col gap-2">
        <h1 className=" ">
          <span className="  font-semibold text-Text_Seguridad">
            Verificar código
          </span>
          <br />
          <span className="  text-3xl md:text-5xl font-bold text-Text_Primary">
            Validación de cuenta
          </span>
        </h1>
        <span className=" font-semibold text-Text_Secondary ">
          Código enviado al Whatsapp{" "}
          {accessData?.telefono &&
            maskInformation(`${accessData?.telefono}`, "phone")}{" "}
          y Correo electrónico{" "}
          {accessData?.correo && maskInformation(accessData?.correo, "email")}
        </span>
      </div>

      <div className=" w-full flex flex-col gap-6  rounded-2xl ">
        <PinInput
          hideLabel
          pinLength={pinLength}
          codeValues={codeValues}
          setCodeValues={setCodeValues}
        />

        <Button
          primary
          title={isVerifying ? "Verificando..." : "Verificar"}
          onClick={validatePin}
          disabled={isVerifying}
        />

        {seconds === 0 && (
          <Button
            title={"Reenviar código"}
            onClick={handleResend}
            className="border border-solid border-black/20"
          />
        )}

        {seconds !== 0 && (
          <p className=" text-center text-sky-900 font-normal">
            Podrás solicitar un nuevo código en{" "}
            <span className=" font-semibold">{`${seconds} segundos`}</span>
          </p>
        )}
      </div>
    </main>
  );
}
