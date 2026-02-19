"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FormButton } from "./FormButton";

export function Header() {
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        try {
            const item = localStorage.getItem("user");
            if (item) {
                const u = JSON.parse(item);
                setUserName(u?.name);
            }
        } catch (e) {
            console.error("failed to read user from localStorage", e);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    return (
        <div className="bg-orange-500 fixed top-0 right-0 left-0 py-2 shadow-xl flex items-center justify-end px-4 gap-2">
            <Link className="font-bold text-lg text-white absolute left-1/2 transform -translate-x-1/2" href="/">
                MAIS VARIEDADES
            </Link>
            {userName ? (
                <>
                    <span className="font-bold text-sm text-white">{userName}</span>
                    <FormButton
                        onClick={handleLogout}
                        className="font-bold text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition border"
                    >
                        Sair
                    </FormButton>
                </>
            ) : (
                <>
                    <Link
                        href="/login"
                        className="font-bold text-sm bg-lime-600 text-white px-3 py-1 rounded hover:bg-lime-700 transition border"
                    >
                        Entrar
                    </Link>
                    <Link
                        href="/users"
                        className="font-bold text-sm bg-cyan-600 text-white px-3 py-1 rounded hover:bg-cyan-700 transition border"
                    >
                        Cadastrar
                    </Link>
                </>
            )}
        </div>
    );
}
